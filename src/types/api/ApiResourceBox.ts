export interface ApiResourceBox {
  resourceBoxPurpose: ApiResourceBoxPurpose;
  id: 1;
  resourceBoxType: 'expand';
  details: ApiResourceBoxDetail[];
}

export interface ApiResourceBoxDetail {
  resourceBoxPurpose: ApiResourceBoxPurpose;
  resourceBoxId: number;
  seq: number;
  resourceType:
    | 'avatar_costume'
    | 'paid_jewel'
    | 'jewel'
    | 'live_point'
    | 'gacha_ticket'
    | 'material'
    | 'coin'
    | 'honor'
    | 'skill_practice_ticket'
    | 'stamp'
    | 'boost_item'
    | 'costume_3d'
    | 'colorful_pass'
    | 'bonds_honor'
    | 'bonds_honor_word';
  resourceId?: number;
  resourceQuantity: number;
}

export type ApiResourceBoxPurpose =
  | 'billing_shop_item'
  | 'billing_shop_item_bonus'
  | 'bonds_reward'
  | 'character_rank_reward'
  | 'cheerful_carnival_result_reward'
  | 'cheerful_carnival_reward'
  | 'compensation'
  | 'episode_reward'
  | 'event_ranking_reward'
  | 'gacha_ceil_exchange'
  | 'gacha_extra'
  | 'gift_detail'
  | 'login_bonus'
  | 'master_lesson_reward'
  | 'material_exchange'
  | 'mission_reward'
  | 'rank_match_season_tier_reward'
  | 'score_rank_reward_detail'
  | 'challenge_live_play_day_reward'
  | 'challenge_live_score_rank_reward_detail'
  | 'multi_score_rank_reward_detail'
  | 'music_achievement'
  | 'player_rank_reward'
  | 'shop_item'
  | 'virtual_shop_item';
