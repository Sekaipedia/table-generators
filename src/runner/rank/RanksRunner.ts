import { Answers, DistinctQuestion } from 'inquirer';
import {
  ApiLevel,
  ApiLevelType,
  ApiResourceBox,
  ApiResourceBoxDetail,
  ApiResourceBoxPurpose,
} from '../../types/api';
import AbstractRunner from '../AbstractRunner';
import OutputFormat from '../OutputFormat';
import RankInfo from './RankInfo';

export default abstract class RanksRunner<
  T extends RankInfo
> extends AbstractRunner {
  private levelFilter?: string;
  private resourceBoxFilter?: string;

  protected levels: ApiLevel[];
  protected resourceBoxes: Record<number, ApiResourceBoxDetail[]>;

  public constructor(
    validOutputFormats: OutputFormat[],
    levelFilter: ApiLevelType,
    resourceBoxFilter: ApiResourceBoxPurpose
  ) {
    super(validOutputFormats);

    this.levelFilter = levelFilter;
    this.resourceBoxFilter = resourceBoxFilter;

    this.levels = [];
    this.resourceBoxes = {};
  }

  protected override getInputPrompts(): DistinctQuestion<Answers>[] {
    return [
      {
        type: 'confirm',
        name: 'limitRanks',
        message: 'Generate a specific range?',
        default: false,
      },
      {
        type: 'number',
        name: 'minRank',
        message: 'Minimum rank:',
        when: (answers: Answers) => answers.limitRanks,
        validate: (input: number) => {
          if (isNaN(input)) {
            return 'Needs to be a number';
          } else if (input <= 0) {
            return 'Needs to be greater than 0';
          } else {
            return true;
          }
        },
      },
      {
        type: 'number',
        name: 'maxRank',
        message: 'Maxmimum rank (inclusive):',
        when: (answers: Answers) => answers.limitRanks,
        validate: (input: number, answers: Answers) => {
          const { minRank } = answers;

          if (isNaN(input)) {
            return 'Needs to be a number';
          } else if (input <= minRank) {
            return `Needs to be greater than ${minRank}`;
          } else {
            return true;
          }
        },
      },
    ];
  }

  protected async setDataFromRemote(): Promise<void> {
    const levelsResponse: Response = await fetch(
      'https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main/levels.json'
    );
    const levels: ApiLevel[] = await levelsResponse.json();
    this.levels =
      typeof this.levelFilter !== 'undefined'
        ? levels.filter(({ levelType }) => levelType === this.levelFilter)
        : levels;

    const rbResponse: Response = await fetch(
      'https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main/resourceBoxes.json'
    );
    const resourceBoxes: ApiResourceBox[] = await rbResponse.json();
    resourceBoxes.forEach(({ id, resourceBoxPurpose, details }) => {
      if (
        typeof this.resourceBoxFilter === 'undefined' ||
        resourceBoxPurpose === this.resourceBoxFilter
      ) {
        this.resourceBoxes[id] = details;
      }
    });
  }

  protected abstract getRankInfoFromLevels(levels: ApiLevel[]): T[];

  protected getBoundedRankInfo(): T[] {
    const { limitRanks, minRank, maxRank } = this.promptAnswers;

    let levels: ApiLevel[] = this.levels;
    let rankInfo: T[] = [];

    if (levels.length > 0) {
      if (limitRanks) {
        levels = this.levels.filter(
          ({ level }) => level >= minRank && level <= maxRank + 1
        );
      }

      rankInfo = this.getRankInfoFromLevels(levels);

      if (limitRanks && rankInfo[rankInfo.length - 1].level > maxRank) {
        rankInfo = rankInfo.slice(0, -1);
      }
    }

    return rankInfo;
  }

  protected getContent(): string | null {
    const rankInfo: T[] = this.getBoundedRankInfo();

    switch (this.promptAnswers[AbstractRunner.OUTPUT_FORMAT_PROMPT_NAME]) {
      case OutputFormat.WIKITEXT_CONSOLE:
      case OutputFormat.WIKITEXT_TXT:
        return this.getWikitextContent(rankInfo);
      case OutputFormat.CSV:
        return this.getCsvContent(rankInfo);
      case OutputFormat.MARKDOWN_CONSOLE:
      case OutputFormat.MARKDOWN_MD:
        return this.getMarkdownContent(rankInfo);
      default:
        return null;
    }
  }

  protected abstract getWikitextContent(rankInfo: T[]): string;
  protected abstract getCsvContent(rankInfo: T[]): string;
  protected abstract getMarkdownContent(rankInfo: T[]): string;
}
