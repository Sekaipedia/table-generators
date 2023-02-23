import pluralize from 'pluralize-esm';
import {
  ApiLevel,
  ApiResourceBoxDetail,
  ApiPlayerRankRewards,
} from '../../types/api';
import ResourceBoxItem from '../../types/ResourceBoxItem';
import OutputFormat from '../OutputFormat';
import RankInfo from './RankInfo';
import RanksRunner from './RanksRunner';

interface PlayerRankInfo extends RankInfo {
  boxRewards: ResourceBoxItem[];
}

export default class PlayerRanksRunner extends RanksRunner<PlayerRankInfo> {
  private playerRankRewards: Record<number, number>;

  public constructor() {
    super(
      [
        OutputFormat.WIKITEXT_CONSOLE,
        OutputFormat.WIKITEXT_TXT,
        OutputFormat.MARKDOWN_CONSOLE,
        OutputFormat.MARKDOWN_MD,
      ],
      'user',
      'player_rank_reward'
    );
    this.playerRankRewards = {};
  }

  protected async setDataFromLocal(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected override async setDataFromRemote(): Promise<void> {
    await super.setDataFromRemote();

    const rewardsResponse = await fetch(
      'https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main/playerRankRewards.json'
    );
    const playerRankRewards: ApiPlayerRankRewards[] =
      await rewardsResponse.json();
    playerRankRewards.forEach(
      ({ playerRank, resourceBoxId }) =>
        (this.playerRankRewards[playerRank] = resourceBoxId)
    );
  }

  protected override getRankInfoFromLevels(
    levels: ApiLevel[]
  ): PlayerRankInfo[] {
    const rankInfo: PlayerRankInfo[] = [];

    for (let i = 0; i < levels.length; i++) {
      const { level, totalExp } = levels[i];
      let nextExp = NaN;

      if (i < levels.length - 1) {
        nextExp = levels[i + 1].totalExp - totalExp;
      }

      const resourceBoxId: number = this.playerRankRewards[level];

      const rewardsFromResourceBox: ApiResourceBoxDetail[] =
        this.resourceBoxes[resourceBoxId] ?? [];

      rankInfo.push({
        level,
        boxRewards: rewardsFromResourceBox.map(
          (resourceBoxDetail: ApiResourceBoxDetail) =>
            ResourceBoxItem.fromApi(resourceBoxDetail)
        ),
        totalExp,
        nextExp: !isNaN(nextExp) ? nextExp : '',
      });
    }

    return rankInfo;
  }

  protected getWikitextContent(rankInfo: PlayerRankInfo[]): string {
    const content: string[] = [
      '{| class="wikitable"',
      '! Rank',
      '! Rewards',
      '! Total EXP',
      '! EXP to next rank',
    ];

    for (const { level, boxRewards, totalExp, nextExp } of rankInfo) {
      const rewards: string[] = boxRewards.map((boxReward: ResourceBoxItem) => {
        const item: string = boxReward.getItem() ?? '';
        const quantity: number = boxReward.getQuantity();
        switch (item) {
          case 'Title':
            return `[[File:Title level ${getTitleLevel(
              level
            )}.png|56px|link=]] Player Rank ${level} title`;
          case 'Live bonus drink (large)':
            return `{{Item thumbnail|item=${item}|count=${quantity}|size=56px}} ${
              quantity > 1
                ? 'Live bonus drinks (large)'
                : 'Live bonus drink (large)'
            }`;
          default:
            return `{{Item thumbnail|item=${item}|count=${quantity}|size=56px}} ${pluralize(
              item,
              quantity
            )}`;
        }
      });
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
  protected getCsvContent(rankInfo: PlayerRankInfo[]): string {
    throw new Error('Method not implemented.');
  }

  protected getMarkdownContent(rankInfo: PlayerRankInfo[]): string {
    const content: string[] = [
      '| Rank | Rewards | Total EXP | EXP to next rank |',
      '| ---- | ------- | --------- | -----------------|',
    ];

    for (const { level, boxRewards, totalExp, nextExp } of rankInfo) {
      const rewards: string[] = boxRewards.map((boxReward: ResourceBoxItem) => {
        const item: string = boxReward.getItem() ?? '';
        const quantity: number = boxReward.getQuantity();
        switch (item) {
          case 'Title':
            return `Player Rank ${level} title`;
          default:
            return `${item} \u00d7${quantity}`;
        }
      });

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

const getTitleLevel = (rank: number): number => {
  if (rank >= 100) {
    return 2;
  } else {
    return 1;
  }
};
