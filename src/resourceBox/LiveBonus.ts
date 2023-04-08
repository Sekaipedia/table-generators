export default class LiveBonus {
  private static readonly map: Record<number, string> = {
    1: 'Live bonus drink (small)', // ライブボーナスドリンク（小）
    2: 'Live bonus drink (large)', // ライブボーナスドリンク（大）
  };

  public static get(id: number): string | null {
    return LiveBonus.map[id];
  }
}
