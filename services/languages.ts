/**
 * Create docker images for different languages
 * to execute code inside it later
 *
 * Save the final object in MongoDB
 */

export interface Language {
  _id: string;
  image: string;
  tags: string[];
  // the command to execute a FILENAME
  // example:
  // python PATH_TO_FILE
  // gcc PATH_TO_FILE && PATH_TO_FILE
  cmd: string;
}
