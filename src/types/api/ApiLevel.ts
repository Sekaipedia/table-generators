export interface ApiLevel {
  id: number;
  levelType: ApiLevelType;
  level: number;
  totalExp: number;
}

export type ApiLevelType =
  | 'card_skill_1'
  | 'card_skill_2'
  | 'card_skill_3'
  | 'card_skill_4'
  | 'card_skill_birthday'
  | 'card'
  | 'user'
  | 'character'
  | 'bonds';
