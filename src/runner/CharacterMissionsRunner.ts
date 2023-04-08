import { DistinctQuestion } from 'inquirer';
import AbstractRunner from './AbstractRunner';
import { ApiCharacterMissionV2ParameterGroup } from '../types/api';
import { OutputFormat } from '../types/runner';

interface MissionInfo {
  requirement: number;
  difference: number | string;
  experience: number;
}

export default class CharacterMissionsRunner extends AbstractRunner {
  private data: ApiCharacterMissionV2ParameterGroup[];

  public constructor() {
    super([
      OutputFormat.WIKITEXT_CONSOLE,
      OutputFormat.WIKITEXT_TXT,
      OutputFormat.CSV,
      OutputFormat.MARKDOWN_CONSOLE,
      OutputFormat.MARKDOWN_MD,
    ]);
    this.data = [];
  }

  protected override getInputPrompts(): DistinctQuestion[] {
    return [
      {
        type: 'rawlist',
        name: 'missionType',
        message: 'Mission type:',
        pageSize: 10,
        // prettier-ignore
        choices: [
          { name: 'Lives',              value: 1 }, // play_live
          { name: 'Duplicates',         value: 2 }, // waiting_room
          { name: 'Costumes',           value: 3 }, // collect_costume_3d
          { name: 'Stamps',             value: 4 }, // collect_stamp
          { name: 'Area conversations', value: 5 }, // read_area_talk
          { name: 'Side story 1',       value: 6 }, // read_card_episode_first
          { name: 'Side story 2',       value: 7 }, // read_card_episode_second
          { name: 'Another vocals',     value: 8 }, // collect_another_vocal
          { name: 'Character area items (excl. Miku)',      value: 9  }, // area_item_level_up_character
          { name: 'Character area items (Miku)',            value: 10 }, // area_item_level_up_character (Miku only)
          { name: 'Unit area items (excl. VIRTUAL SINGER)', value: 11 }, // area_item_level_up_unit
          { name: 'Unit area items (VIRTUAL SINGER)',       value: 12 }, // area_item_level_up_unit (VIRTUAL SINGER only)
          { name: 'Attribute area items',                   value: 13 }, // area_item_level_up_reality_world
          { name: 'Cards',                                  value: 14 }, // collect_member
          { name: 'Skill level ups (4☆, birthday, anniversary)', value: 15 }, // skill_level_up_rare
          { name: 'Skill level ups (3☆, 2☆, 1☆)',               value: 16 }, // skill_level_up_standard
          { name: 'Master Ranks (4☆, birthday, anniversary)',    value: 17 }, // master_rank
          { name: 'Master Ranks (3☆, 2☆, 1☆)',                  value: 18 }, // master_rank_up_standard
        ],
      },
    ];
  }

  protected async setDataFromLocal(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected async setDataFromRemote(): Promise<void> {
    const response = await fetch(
      'https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main/characterMissionV2ParameterGroups.json'
    );
    this.data = await response.json();
  }

  protected getContent(): string | null {
    const missions: ApiCharacterMissionV2ParameterGroup[] = this.data.filter(
      ({ id }) => id === this.promptAnswers.missionType
    );
    const missionInfo: Generator<MissionInfo> = getMissionInfo(missions);

    switch (this.promptAnswers[AbstractRunner.OUTPUT_FORMAT_PROMPT_NAME]) {
      case OutputFormat.WIKITEXT_CONSOLE:
      case OutputFormat.WIKITEXT_TXT:
        return this.getWikitextContent(missionInfo);
      case OutputFormat.CSV:
        return this.getCsvContent(missionInfo);
      case OutputFormat.MARKDOWN_CONSOLE:
      case OutputFormat.MARKDOWN_MD:
        return this.getMarkdownContent(missionInfo);
      default:
        return null;
    }
  }

  private getWikitextContent(missionInfo: Iterable<MissionInfo>): string {
    const content: string[] = [
      '{| class="wikitable"',
      '! Requirement',
      '! Difference <br> <small>(from previous)</small>',
      '! EXP',
    ];

    for (const { requirement, difference, experience } of missionInfo) {
      content.push('|-');
      content.push(
        `| ${requirement.toLocaleString(
          'en-US'
        )} || ${difference.toLocaleString('en-US')} || ${experience}`
      );
    }

    content.push('|}');

    return content.join('\n');
  }

  private getCsvContent(missionInfo: Iterable<MissionInfo>): string {
    const content: string[] = ['Requirement,Difference (from previous),EXP'];

    for (const { requirement, difference, experience } of missionInfo) {
      content.push(`${requirement},${difference},${experience}`);
    }

    return content.join('\n');
  }

  private getMarkdownContent(missionInfo: Iterable<MissionInfo>): string {
    const content: string[] = [
      '| Requirement | Difference (from previous) | EXP |',
      '| ----------- | -------------------------- | --- |',
    ];

    for (const { requirement, difference, experience } of missionInfo) {
      content.push(
        `| ${requirement.toLocaleString('en-US')} | ${difference.toLocaleString(
          'en-US'
        )} | ${experience} | `
      );
    }

    return content.join('\n');
  }
}

const getMissionInfo = function* (
  missions: ApiCharacterMissionV2ParameterGroup[]
): Generator<MissionInfo> {
  let prev = NaN;

  for (const { requirement, exp } of missions) {
    yield {
      requirement,
      difference: !isNaN(prev) ? requirement - prev : '-',
      experience: exp,
    };
    prev = requirement;
  }
};
