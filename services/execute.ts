/**
 * This modules handles code execution logic
 */

import { Container } from '../utils/docker/container.js';

/**
 * Execute a code snippet in a container
 *
 * @param language the language you need to execute the code with
 * @param code the script to execute
 *
 * @returns the result of the execution
 */
export async function execute(Image: string, Cmd: string[], code: string) {
  const container = await Container.create({ Image, Cmd });

  if (container === null) throw new Error('Language is not supported');

  await container.writeFile('SOURCE_CODE', code, './');

  await container.start(true);

  const output = await container.logs();

  await container.remove();

  return output;
}
