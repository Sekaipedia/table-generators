import inquirer from 'inquirer';
import {
  AbstractRunner,
  CardLevelRunner,
  CharacterMissionsRunner,
  CharacterRanksRunner,
  KizunaRanksRunner,
  PlayerRanksRunner,
  RunnerFactory,
} from './runner';

(async () => {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'runnerChoice',
      choices: [
        { name: 'Character missions', value: CharacterMissionsRunner.name },
        { name: 'Character Ranks', value: CharacterRanksRunner.name },
        { name: 'Player Ranks', value: PlayerRanksRunner.name },
        { name: 'Kizuna Ranks', value: KizunaRanksRunner.name },
        { name: 'Card levels', value: CardLevelRunner.name },
      ],
    },
  ]);
  const runner: AbstractRunner = RunnerFactory.getRunner(answers.runnerChoice);
  await runner.run();
})();
