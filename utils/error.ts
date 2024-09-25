/** Module to handle errors for the API */

export default class CunnErr extends Error {
  statusCode: number
  constructor(code: number, message?: string) {
    super(message);
    this.statusCode = code;
  }
}
