/**
 * This modules handles code execution logic
 */

import { Container } from '../utils/docker/container.js';
import { Language } from '../models/language.model.js';

/**
 * Execute a code snippet in a container
 *
 * @param language the language you need to execute the code with
 * @param code the script to execute
 *
 * @returns the result of the execution
 */
export async function execute(language: Language, code: string) {
  const container = await Container.create({
    Image: language.name,
    Cmd: language.cmd,
  });

  if (container === null) throw new Error("Language is not supported");

  await container.writeFile('SOURCE_CODE', code, './');

  await container.start(true);

  const output = await container.logs();

  await container.remove();

  return output;
}
