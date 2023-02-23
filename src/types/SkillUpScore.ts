export class SkillUpScore {
  private static readonly map: Record<number, string> = {
    1: 'Skill up score (beginner)', //スキルアップ用スコア（初級）,
    2: 'Skill up score (intermediate)', // スキルアップ用スコア（中級）
    3: 'Skill up score (advanced)', // スキルアップ用スコア（上級）
  };

  public static get(id: number): string | null {
    return SkillUpScore.map[id];
  }
}
