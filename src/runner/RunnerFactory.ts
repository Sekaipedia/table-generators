import AbstractRunner from './AbstractRunner';
import CardLevelRunner from './CardLevelRunner';
import CharacterMissionsRunner from './CharacterMissionsRunner';
import CharacterRanksRunner from './rank/CharacterRanksRunner';
import KizunaRanksRunner from './rank/KizunaRanksRunner';
import PlayerRanksRunner from './rank/PlayerRanksRunner';

class RunnerFactory {
  public static getRunner(runnerChoice: string): AbstractRunner | null {
    switch (runnerChoice) {
      case CardLevelRunner.name:
        return new CardLevelRunner();
      case CharacterMissionsRunner.name:
        return new CharacterMissionsRunner();
      case CharacterRanksRunner.name:
        return new CharacterRanksRunner();
      case PlayerRanksRunner.name:
        return new PlayerRanksRunner();
      case KizunaRanksRunner.name:
        return new KizunaRanksRunner();
    }

    return null;
  }
}

export default RunnerFactory;
