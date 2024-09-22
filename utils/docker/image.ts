/** Docker images object mapper */
import { Container } from './container.js';
import dockerAPI from './index.js';

export default class Image {
  name: string;

  constructor(name: string, tag: string) {
    this.name = `${name}:${tag}`;
  }

  static async pull(name: string, tag = 'latest') {
    await dockerAPI(`/images/create?fromImage=${name}:${tag}`, 'POST');
    return new Image(name, tag);
  }

  async createContainer(cmd?: string[]) {
    return await Container.create({ Image: this.name, Cmd: cmd });
  }

  // async delete() {}
}
