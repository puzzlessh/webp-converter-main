const chalk = require('chalk');
import { Command } from 'commander';
import { join, normalize } from 'node:path';
import { convertToWebp } from './converter';

const program = new Command();

program
  .version('0.0.1')
  .option('-i, --input <char>', 'input directory', process.cwd())
  .option('-o, --output <char>', 'output directory', join(process.cwd(), 'webp'));

program.parse();

const OPTIONS = program.opts<{ input: string; output: string }>();
const INPUT_PATH = normalize(OPTIONS.input);
const OUTPUT_PATH = normalize(OPTIONS.output);

async function main() {
  console.log(chalk.blue(`Input path: ${INPUT_PATH}`));
  console.log(chalk.blue(`Output path: ${OUTPUT_PATH}`));

  console.time('Total processing time');
  const results = await convertToWebp(INPUT_PATH, OUTPUT_PATH);

  if (results.success.length === 0 && results.failed.length === 0) {
    return console.log(chalk.blue(`Did not find images for conversion`));
  }

  console.timeEnd('Total processing time');
  console.log(chalk.green(`Conversion completed successfully: ${results.success.length}`));
  console.table(results.success.map(({ name, path }) => ({ name, path: path.replace(INPUT_PATH, '') })));

  console.log(chalk.red(`Conversion completed with error: ${results.failed.length}`));
  console.table(results.failed.map(({ name, error, path }) => ({ name, error, path })));
}

main();
