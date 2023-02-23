export interface ApiBondsReward {
  id: number;
  bondsGroupId: number;
  rank: number;
  seq: number;
  bondsRewardType: 'resource' | 'cut_in_voice';
  resourceBoxId?: number;
  description: string;
}
