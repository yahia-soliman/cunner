/** Module to handle errors for the API */

export default class CunnErr extends Error {
  code: number
  constructor(code: number, message?: string) {
    super(message);
    this.code = code;
  }
}
