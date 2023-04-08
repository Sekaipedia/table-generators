import pluralize from 'pluralize-esm';
import RanksRunner from './RanksRunner';
import ResourceBoxItem from '../../resourceBox/ResourceBoxItem';
import {
  ApiCharacterRank,
  ApiCharacterRankAchieveResource,
  ApiLevel,
  ApiResourceBoxDetail,
} from '../../types/api';
import { OutputFormat, RankInfo } from '../../types/runner';

interface CharacterRankInfo extends RankInfo {
  materialRewards: ResourceBoxItem[];
  achieveResources: ApiCharacterRankAchieveResource[];
  bonus: number;
}

interface CharacterRankReward {
  resourceBoxIds: number[];
  achieveResources: ApiCharacterRankAchieveResource[];
}

export default class CharacterRanksRunner extends RanksRunner<CharacterRankInfo> {
  private characterRanks: Record<number, CharacterRankReward>;

  public constructor() {
    super(
      [
        OutputFormat.WIKITEXT_CONSOLE,
        OutputFormat.WIKITEXT_TXT,
        OutputFormat.MARKDOWN_CONSOLE,
        OutputFormat.MARKDOWN_MD,
      ],
      'character',
      'character_rank_reward'
    );
    this.characterRanks = {};
  }

  protected async setDataFromLocal(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected override async setDataFromRemote(): Promise<void> {
    await super.setDataFromRemote();

    const crResponse: Response = await fetch(
      'https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main/characterRanks.json'
    );
    const characterRanks: ApiCharacterRank[] = await crResponse.json();
    characterRanks.forEach(
      ({
        characterId,
        characterRank,
        rewardResourceBoxIds,
        characterRankAchieveResources,
      }) => {
        if (characterId === 1) {
          this.characterRanks[characterRank] = {
            resourceBoxIds: rewardResourceBoxIds,
            achieveResources: characterRankAchieveResources,
          };
        }
      }
    );
  }

  protected getRankInfoFromLevels(levels: ApiLevel[]): CharacterRankInfo[] {
    const rankInfo: CharacterRankInfo[] = [];

    for (let i = 0; i < levels.length; i++) {
      const { level, totalExp } = levels[i];
      let nextExp = NaN;

      if (i < levels.length - 1) {
        nextExp = levels[i + 1].totalExp - totalExp;
      }

      const { resourceBoxIds, achieveResources } = this.characterRanks[level];

      const rewardsFromResourceBox: ApiResourceBoxDetail[] = resourceBoxIds
        .map((resourceBoxId: number) => this.resourceBoxes[resourceBoxId] ?? [])
        .flat();

      rankInfo.push({
        level,
        materialRewards: rewardsFromResourceBox.map(
          (resourceBoxDetail: ApiResourceBoxDetail) =>
            ResourceBoxItem.fromApi(resourceBoxDetail)
        ),
        achieveResources,
        bonus: level / 10,
        totalExp,
        nextExp: !isNaN(nextExp) ? nextExp : '',
      });
    }

    return rankInfo;
  }

  protected getWikitextContent(rankInfo: CharacterRankInfo[]): string {
    const content: string[] = [
      '{| class="wikitable"',
      '! Rank',
      '! Rewards',
      '! Bonus',
      '! Total EXP',
      '! EXP to next rank',
    ];

    for (const {
      level,
      materialRewards,
      achieveResources,
      bonus,
      totalExp,
      nextExp,
    } of rankInfo) {
      const materialRewardStr: string[] = materialRewards.map(
        (materialReward) => {
          const item: string = materialReward.getItem() ?? '';
          const quantity: number = materialReward.getQuantity();

          switch (item) {
            case 'Title':
              return `[[File:Title level ${getTitleLevel(
                level
              )}.png|56px|link=]] Character Fan Rank ${getTitleRankLevel(
                level
              )}`;
            case 'Stamp':
              return `[[File:${getStampImage(
                level
              )}.png|link=Stamps|56px]] Character stamp`;
            case 'Vocal card':
              return '{{Item thumbnail|item=Vocal card (Miku)|count=1|link=Vocal card|size=56px}} Vocal card';
            case 'Avatar costume':
              return '[[File:Avatar costume 0021.png|56px|link=]] Character Support T-shirt';
            default:
              return `{{Item thumbnail|item=${item}|count=${quantity}|size=56px}} ${pluralize(
                item,
                quantity
              )}`;
          }
        }
      );

      const rewards: string[] = [...materialRewardStr];

      if (achieveResources.length > 0) {
        rewards.push(
          '[[File:Challenge Live slot.png|56px|link=Challenge Live]] Challenge Live slot'
        );
      }

      if (rewards.length > 1) {
        const rowspan: number = rewards.length;

        content.push('|-');
        content.push(`| rowspan="${rowspan}" | ${level}`);
        content.push(`| ${rewards[0]}`);
        content.push(`| rowspan="${rowspan}" | +${bonus}%`);
        content.push(`| rowspan="${rowspan}" | ${totalExp}`);
        content.push(`| rowspan="${rowspan}" | ${nextExp}`);

        rewards.slice(1).forEach((reward: string) => {
          content.push('|-');
          content.push(`| ${reward}`);
        });
      } else {
        content.push('|-');
        content.push(`| ${level}`);
        content.push(`| ${rewards.length === 0 ? '' : rewards[0]}`);
        content.push(`| +${bonus}%`);
        content.push(`| ${totalExp}`);
        content.push(`| ${nextExp}`);
      }
    }

    content.push('|}');

    return content.join('\n');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getCsvContent(rankInfo: CharacterRankInfo[]): string {
    throw new Error('Method not implemented.');
  }

  protected getMarkdownContent(rankInfo: CharacterRankInfo[]): string {
    const content: string[] = [
      '| Rank | Rewards | Bonus | Total EXP | EXP to next rank |',
      '| ---- | ------- | ----- | --------- | -----------------|',
    ];

    for (const {
      level,
      materialRewards,
      achieveResources,
      bonus,
      totalExp,
      nextExp,
    } of rankInfo) {
      const materialRewardStr: string[] = materialRewards.map(
        (materialReward) => {
          const item: string = materialReward.getItem() ?? '';
          const quantity: number = materialReward.getQuantity();

          switch (item) {
            case 'Title':
              return `Character Fan Rank ${getTitleRankLevel(level)}`;
            case 'Stamp':
              return `Character stamp`;
            case 'Avatar costume':
              return 'Character Support T-shirt';
            default:
              return `${item} \u00d7${quantity}`;
          }
        }
      );

      const rewards: string[] = [...materialRewardStr];

      if (achieveResources.length > 0) {
        rewards.push('Challenge Live slot');
      }

      content.push(
        `| ${level} | ${rewards.join(
          ' <br> '
        )} | +${bonus}% | ${totalExp.toLocaleString('en-US')} | ${
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
  if (rank >= 95) {
    return 3;
  } else if (rank >= 30) {
    return 2;
  } else {
    return 1;
  }
};

const getTitleRankLevel = (rank: number): number => Math.floor(rank / 5);

const getStampImage = (rank: number): string => {
  if (rank === 38) {
    return 'Stamp0032.png';
  } else if (rank === 58) {
    return 'Stamp0521.png';
  } else if (rank === 88) {
    return 'Stamp0576.png';
  }

  return '';
};
