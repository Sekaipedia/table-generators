export default class Material {
  // prettier-ignore
  private static readonly map: Record<number, string> = {
    6: 'Cute gem',        // キュートジェム
    7: 'Cool gem',        // クールジェム
    8: 'Pure gem',        // ピュアジェム
    9: 'Happy gem',       // ハッピージェム
    10: 'Mysterious gem', // ミステリアスジェム
    11: 'Magic cloth',    // 魔法の布
    12: 'Magic thread',   // 魔法の糸
    13: 'Song card',      // ミュージックカード
    14: 'Miracle gem',    // ミラクルジェム
    15: 'Fragment of feelings',     // 想いのカケラ
    16: 'Pure crystal of feelings', // 想いの純結晶
    17: 'Mysterious seed',          // ふしぎな種
    18: 'Vocal card', // 一歌のボーカルカード
    19: 'Vocal card', // 咲希のボーカルカード
    20: 'Vocal card', // 穂波のボーカルカード
    21: 'Vocal card', // 志歩のボーカルカード
    22: 'Vocal card', // みのりのボーカルカード
    23: 'Vocal card', // 遥のボーカルカード
    24: 'Vocal card', // 愛莉のボーカルカード
    25: 'Vocal card', // 雫のボーカルカード
    26: 'Vocal card', // こはねのボーカルカード
    27: 'Vocal card', // 杏のボーカルカード
    28: 'Vocal card', // 彰人のボーカルカード
    29: 'Vocal card', // 冬弥のボーカルカード
    30: 'Vocal card', // 司のボーカルカード
    31: 'Vocal card', // えむのボーカルカード
    32: 'Vocal card', // 寧々のボーカルカード
    33: 'Vocal card', // 類のボーカルカード
    34: 'Vocal card', // 奏のボーカルカード
    35: 'Vocal card', // まふゆのボーカルカード
    36: 'Vocal card', // 絵名のボーカルカード
    37: 'Vocal card', // 瑞希のボーカルカード
    38: 'Vocal card', // ミクのボーカルカード
    39: 'Vocal card', // リンのボーカルカード
    40: 'Vocal card', // レンのボーカルカード
    41: 'Vocal card', // ルカのボーカルカード
    42: 'Vocal card', // MEIKOのボーカルカード
    43: 'Vocal card', // KAITOのボーカルカード
    44: 'Stamp exchange ticket', //スタンプ交換券
  };

  public static get(id: number): string | null {
    return Material.map[id];
  }
}
