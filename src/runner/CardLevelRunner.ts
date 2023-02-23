import { ApiLevel } from '../types/api';
import AbstractRunner from './AbstractRunner';
import OutputFormat from './OutputFormat';

interface LevelInfo {
  level: number;
  totalExp: number;
  nextExp: number | string;
}

export default class CardLevelRunner extends AbstractRunner {
  private levels: ApiLevel[];

  public constructor() {
    super([
      OutputFormat.WIKITEXT_CONSOLE,
      OutputFormat.WIKITEXT_TXT,
      OutputFormat.CSV,
      OutputFormat.MARKDOWN_CONSOLE,
      OutputFormat.MARKDOWN_MD,
    ]);
    this.levels = [];
  }

  protected setDataFromLocal(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected async setDataFromRemote(): Promise<void> {
    const response: Response = await fetch(
      'https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main/levels.json'
    );
    const levels: ApiLevel[] = await response.json();
    this.levels = levels.filter(({ levelType }) => levelType === 'card');
  }

  protected getContent(): string | null {
    const levelInfo: LevelInfo[] = getLevelInfo(this.levels);

    switch (this.promptAnswers[AbstractRunner.OUTPUT_FORMAT_PROMPT_NAME]) {
      case OutputFormat.WIKITEXT_CONSOLE:
      case OutputFormat.WIKITEXT_TXT:
        return this.getWikitextContent(levelInfo);
      case OutputFormat.CSV:
        return this.getCsvContent(levelInfo);
      case OutputFormat.MARKDOWN_CONSOLE:
      case OutputFormat.MARKDOWN_MD:
        return this.getMarkdownContent(levelInfo);
      default:
        return null;
    }
  }

  private getWikitextContent(levelInfo: LevelInfo[]): string {
    const content: string[] = [
      '{| class="wikitable"',
      '! Level',
      '! Total EXP',
      '! EXP to next level',
    ];

    for (const { level, totalExp, nextExp } of levelInfo) {
      content.push('|-');
      content.push(`| ${level}`);
      content.push(`| ${totalExp.toLocaleString('en-US')}`);
      content.push(
        `| ${
          typeof nextExp === 'number'
            ? nextExp.toLocaleString('en-US')
            : nextExp
        }`
      );
    }

    content.push('|}');

    return content.join('\n');
  }

  private getCsvContent(levelInfo: LevelInfo[]): string {
    const content: string[] = ['Level,Total EXP,EXP to next level'];

    for (const { level, totalExp, nextExp } of levelInfo) {
      content.push(`${level},${totalExp},${nextExp}`);
    }

    return content.join('\n');
  }

  private getMarkdownContent(levelInfo: LevelInfo[]): string {
    const content: string[] = [
      '| Level | Total EXP | EXP to next level |',
      '| ----- | --------- | ----------------- |',
    ];

    for (const { level, totalExp, nextExp } of levelInfo) {
      content.push(
        `| ${level} | ${totalExp.toLocaleString('en-US')} | ${
          typeof nextExp === 'number'
            ? nextExp.toLocaleString('en-US')
            : nextExp
        } |`
      );
    }

    return content.join('\n');
  }
}

const getLevelInfo = (ranks: ApiLevel[]): LevelInfo[] => {
  const levelInfo: LevelInfo[] = [];

  for (let i = 0; i < ranks.length; i++) {
    const { level, totalExp } = ranks[i];
    let nextExp = NaN;

    if (i < ranks.length - 1) {
      nextExp = ranks[i + 1].totalExp - totalExp;
    }

    levelInfo.push({
      level,
      totalExp,
      nextExp: !isNaN(nextExp) ? nextExp : '',
    });
  }

  return levelInfo;
};
