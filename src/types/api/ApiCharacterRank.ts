export interface ApiCharacterRank {
  id: number;
  characterId: number;
  characterRank: number;
  power1BonusRate: number;
  power2BonusRate: number;
  power3BonusRate: number;
  rewardResourceBoxIds: number[];
  characterRankAchieveResources: ApiCharacterRankAchieveResource[];
}

export interface ApiCharacterRankAchieveResource {
  releaseConditionId: number;
  characterId: number;
  characterRank: number;
  resources: [];
}
