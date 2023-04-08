import pluralize from 'pluralize-esm';
import RanksRunner from './RanksRunner';
import ResourceBoxItem from '../../resourceBox/ResourceBoxItem';
import {
  ApiBondsReward,
  ApiLevel,
  ApiResourceBoxDetail,
} from '../../types/api';
import { OutputFormat, RankInfo } from '../../types/runner';

interface KizunaRankInfo extends RankInfo {
  boxRewards: ResourceBoxItem[];
  hasCutInReward: boolean;
}

export default class KizunaRanksRunner extends RanksRunner<KizunaRankInfo> {
  private boxRewards: Record<number, number>;
  private cutInRewards: Set<number>;

  public constructor() {
    super(
      [
        OutputFormat.WIKITEXT_CONSOLE,
        OutputFormat.WIKITEXT_TXT,
        OutputFormat.MARKDOWN_CONSOLE,
        OutputFormat.MARKDOWN_MD,
      ],
      'bonds',
      'bonds_reward'
    );
    this.boxRewards = {};
    this.cutInRewards = new Set();
  }

  protected async setDataFromLocal(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected override async setDataFromRemote(): Promise<void> {
    await super.setDataFromRemote();

    const response: Response = await fetch(
      'https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main/bondsRewards.json'
    );
    const rewards: ApiBondsReward[] = await response.json();
    rewards
      .filter(({ bondsGroupId }) => bondsGroupId === 10102) // Hard code to Ichika-Saki Kizuna Pair
      .forEach(({ rank, bondsRewardType, resourceBoxId }) => {
        if (bondsRewardType === 'resource') {
          this.boxRewards[rank] = resourceBoxId;
        } else if (bondsRewardType === 'cut_in_voice') {
          this.cutInRewards.add(rank);
        }
      });
  }

  protected getRankInfoFromLevels(levels: ApiLevel[]): KizunaRankInfo[] {
    const rankInfo: KizunaRankInfo[] = [];

    for (let i = 0; i < levels.length; i++) {
      const { level, totalExp } = levels[i];
      let nextExp = NaN;

      if (i < levels.length - 1) {
        nextExp = levels[i + 1].totalExp - totalExp;
      }

      const resourceBoxId: number = this.boxRewards[level];

      const rewardsFromResourceBox: ApiResourceBoxDetail[] =
        this.resourceBoxes[resourceBoxId] ?? [];

      rankInfo.push({
        level,
        boxRewards: rewardsFromResourceBox.map(
          (resourceBoxDetail: ApiResourceBoxDetail) =>
            ResourceBoxItem.fromApi(resourceBoxDetail)
        ),
        hasCutInReward: this.cutInRewards.has(level),
        totalExp,
        nextExp: !isNaN(nextExp) ? nextExp : '',
      });
    }

    return rankInfo;
  }

  protected getWikitextContent(rankInfo: KizunaRankInfo[]): string {
    const content: string[] = [
      '{| class="wikitable"',
      '! Rank',
      '! Rewards',
      '! Total EXP',
      '! EXP to next rank',
    ];

    for (const {
      level,
      boxRewards,
      hasCutInReward,
      totalExp,
      nextExp,
    } of rankInfo) {
      const rewards: string[] = boxRewards.map((boxReward: ResourceBoxItem) => {
        const item: string = boxReward.getItem() ?? '';
        const quantity: number = boxReward.getQuantity();
        switch (item) {
          case 'Title':
            return `[[File:Title level ${getTitleLevel(
              level
            )}.png|56px|link=]] Kizuna title rank ${getTitleRankLevel(level)}`;
          case 'Title text':
            return `[[File:Title level 1.png|56px|link=]] Kizuna title text`;
          case 'Live bonus drink (large)':
            return `{{Item thumbnail|item=${item}|count=${quantity}|size=56px}} ${
              quantity > 1
                ? 'Live bonus drinks (large)'
                : 'Live bonus drink (large)'
            }`;
          case 'Fragment of feelings':
            return `{{Item thumbnail|item=${item}|count=${quantity}|size=56px}} ${
              quantity > 1 ? 'Fragments of feelings' : 'Fragment of feelings'
            }`;
          default:
            return `{{Item thumbnail|item=${item}|count=${quantity}|size=56px}} ${pluralize(
              item,
              quantity
            )}`;
        }
      });

      if (hasCutInReward) {
        rewards.push(
          `[[File:Kizuna Rank cutin.png|56px|link=|Live interaction voice (cut-in) ${getCutInLevel(
            level
          )}]] Live interaction voice (cut-in) ${getCutInLevel(level)}`
        );
      }

      if (rewards.length > 1) {
        const rowspan: number = rewards.length;
        content.push('|-');
        content.push(`| rowspan="${rowspan}" | ${level}`);
        content.push(`| ${rewards[0]}`);
        content.push(
          `| rowspan="${rowspan}" | ${totalExp.toLocaleString('en-US')}`
        );
        content.push(
          `| rowspan="${rowspan}" | ${
            typeof nextExp === 'number'
              ? nextExp.toLocaleString('en-US')
              : nextExp
          }`
        );
        rewards.slice(1).forEach((reward: string) => {
          content.push('|-');
          content.push(`| ${reward}`);
        });
      } else {
        content.push('|-');
        content.push(`| ${level}`);
        content.push(`| ${rewards.length === 0 ? '' : rewards[0]}`);
        content.push(`| ${totalExp.toLocaleString('en-US')}`);
        content.push(
          `| ${
            typeof nextExp === 'number'
              ? nextExp.toLocaleString('en-US')
              : nextExp
          }`
        );
      }
    }

    content.push('|}');

    return content.join('\n');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getCsvContent(rankInfo: KizunaRankInfo[]): string {
    throw new Error('Method not implemented.');
  }

  protected getMarkdownContent(rankInfo: KizunaRankInfo[]): string {
    const content: string[] = [
      '| Rank | Rewards | Total EXP | EXP to next rank |',
      '| ---- | ------- | --------- | -----------------|',
    ];

    for (const {
      level,
      boxRewards,
      hasCutInReward,
      totalExp,
      nextExp,
    } of rankInfo) {
      const rewards: string[] = boxRewards.map((boxReward: ResourceBoxItem) => {
        const item: string = boxReward.getItem() ?? '';
        const quantity: number = boxReward.getQuantity();
        switch (item) {
          case 'Title':
            return `Kizuna title rank ${getTitleRankLevel(level)}`;
          case 'Title text':
            return `Kizuna title text`;
          default:
            return `${item} \u00d7${quantity}`;
        }
      });

      if (hasCutInReward) {
        rewards.push(`Live interaction voice (cut-in) ${getCutInLevel(level)}`);
      }

      content.push(
        `| ${level} | ${rewards.join(' <br> ')} | ${totalExp.toLocaleString(
          'en-US'
        )} | ${
          typeof nextExp === 'number'
            ? nextExp.toLocaleString('en-US')
            : nextExp
        } |`
      );
    }

    return content.join('\n');
  }
}

const getTitleRankLevel = (rank: number): number => Math.floor(rank / 5);

const getTitleLevel = (rank: number): number => {
  if (rank >= 30) {
    return 2;
  } else {
    return 1;
  }
};

const getCutInLevel = (rank: number): number => {
  if (rank >= 36) {
    return 2;
  } else {
    return 1;
  }
};
