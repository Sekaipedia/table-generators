/// <reference lib="dom" />
import inquirer, { Answers, DistinctQuestion } from 'inquirer';
import saveToFile from '../helper/saveToFile';
import OutputFormat from './OutputFormat';
import OutputTarget from './OutputTarget';

abstract class AbstractRunner {
  protected promptAnswers: Answers;
  protected validOutputFormats: OutputFormat[];

  private static readonly OUTPUT_FORMAT_INFO: Record<
    OutputFormat,
    { name: string; target: OutputTarget }
  > = {
    [OutputFormat.WIKITEXT_CONSOLE]: {
      name: 'Wikitext (stdout)',
      target: OutputTarget.CONSOLE,
    },
    [OutputFormat.WIKITEXT_TXT]: {
      name: 'Wikitext (txt)',
      target: OutputTarget.FILE,
    },
    [OutputFormat.CSV]: {
      name: 'CSV',
      target: OutputTarget.FILE,
    },
    [OutputFormat.MARKDOWN_CONSOLE]: {
      name: 'Markdown (stdout)',
      target: OutputTarget.CONSOLE,
    },
    [OutputFormat.MARKDOWN_MD]: {
      name: 'Markdown (md)',
      target: OutputTarget.FILE,
    },
  };

  protected static readonly OUTPUT_FORMAT_PROMPT_NAME: string = 'outputFormat';

  public constructor(validOutputFormats: OutputFormat[]) {
    this.validOutputFormats = validOutputFormats;
  }

  public async run(): Promise<void> {
    const prompts: DistinctQuestion[] = [
      ...this.getInputPrompts(),
      ...this.getDataPrompts(),
      ...this.getOutputPrompts(),
    ];

    this.promptAnswers = await inquirer.prompt(prompts);

    await this.setDataFromRemote();
    const content: string | null = this.getContent();

    const { outputFormat, outputFile } = this.promptAnswers;

    switch (AbstractRunner.getOutputFormatTarget(outputFormat)) {
      case OutputTarget.CONSOLE:
        console.log(content);
        break;
      case OutputTarget.FILE:
        saveToFile(outputFile, content);
        break;
    }
  }

  protected getInputPrompts(): DistinctQuestion[] {
    return [];
  }

  protected getDataPrompts(): DistinctQuestion[] {
    return [];
  }

  protected getOutputPrompts(): DistinctQuestion[] {
    const outputFormatsRequiringFile: OutputFormat[] = [];

    this.validOutputFormats.forEach((outputFormat: OutputFormat) => {
      if (
        AbstractRunner.getOutputFormatTarget(outputFormat) === OutputTarget.FILE
      ) {
        outputFormatsRequiringFile.push(outputFormat);
      }
    });

    return [
      {
        type: 'list',
        name: AbstractRunner.OUTPUT_FORMAT_PROMPT_NAME,
        message: 'Output format:',
        choices: this.validOutputFormats.map((outputFormat: OutputFormat) => {
          return {
            name: AbstractRunner.getOutputFormatName(outputFormat),
            value: outputFormat,
          };
        }),
      },
      {
        type: 'input',
        name: 'outputFile',
        message: 'Output file:',
        when: (answers: Answers) =>
          outputFormatsRequiringFile.includes(answers.outputFormat),
      },
    ];
  }

  protected abstract setDataFromLocal(): Promise<void>;

  protected abstract setDataFromRemote(): Promise<void>;

  protected abstract getContent(): string | null;

  private static getOutputFormatName(format: OutputFormat): string {
    return AbstractRunner.OUTPUT_FORMAT_INFO[format].name;
  }

  private static getOutputFormatTarget(format: OutputFormat): OutputTarget {
    return AbstractRunner.OUTPUT_FORMAT_INFO[format].target;
  }
}

export default AbstractRunner;
