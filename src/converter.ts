const sharp = require('sharp');
const isImage = require('is-image');

import { mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { basename, join } from 'node:path';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { processDone, ProcessDone, processFailed, ProcessResult, processSuccess } from './types';

function getAllImagesPaths(rootPath: string): string[] {
  const imagePaths: string[] = [];

  const paths = [rootPath];

  while (paths.length > 0) {
    const currentPath = paths.shift()!;
    const currentStat = statSync(currentPath);

    if (currentStat.isDirectory()) {
      const innerPaths = readdirSync(currentPath).map((item) => join(currentPath, item));

      paths.push(...innerPaths);
      continue;
    }

    if (isImage(currentPath)) {
      imagePaths.push(currentPath);
    }
  }

  return imagePaths;
}

function getImageName(filePath: string): string {
  const [name] = basename(filePath).split('.');

  if (!name) {
    throw new Error('Invalid filePath');
  }

  return name;
}

async function convertAndWriteImageToWebp(filePath: string, outPath: string): Promise<void> {
  return sharp(filePath)
    .webp()
    .toFile(join(outPath, `${getImageName(filePath)}.webp`));
}

export async function convertToWebp(input: string, output: string): Promise<ProcessDone> {
  const imagePaths = getAllImagesPaths(input);

  if (imagePaths.length && !existsSync(output)) {
    mkdirSync(output);
  }

  const promises: Promise<ProcessResult>[] = imagePaths.map((filePath) => {
    const name = getImageName(filePath);
    return convertAndWriteImageToWebp(filePath, output)
      .then(() => processSuccess(name, filePath))
      .catch((error) => processFailed(name, filePath, error));
  });

  return Promise.all(promises).then(processDone);
}
