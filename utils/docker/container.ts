import dockerAPI from "./index.js";

export interface ContainerRunOpts {
  Image?: string;
  Cmd?: string[];
}

export class Container {
  id: string;
  private prefix: string;

  constructor(id: string) {
    this.id = id;
    this.prefix = `/containers/${id}`;
  }

  /** Create a container */
  static async create(options: ContainerRunOpts): Promise<Container> {
    const res = await dockerAPI(
      '/containers/create',
      'POST',
      JSON.stringify(options),
      { headers: { 'content-type': 'application/json' } },
    );
    const body = JSON.parse(res.body);
    if (body.Id) {
      return new Container(body.Id);
    }
    throw new Error("Cannot Create a container");
  }

  /** Start the container */
  async start(wait = false) {
    const res = await dockerAPI(this.prefix + '/start', 'POST');
    if (wait) await this.wait();
    return res;
  }

  /** Wait for the container to exit */
  async wait() {
    return await dockerAPI(this.prefix + '/wait', 'POST');
  }

  /** Get the logs from a container */
  async logs() {
    return await dockerAPI(this.prefix + '/logs?stdout=1');
  }

  /** Delete the container */
  async remove() {
    return await dockerAPI(this.prefix, 'DELETE');
  }

  /** Get a tar archive of a `path` in the container */
  // async download(options) { }

  /** Upload data to a file inside the container */
  // async upload(options) {
  // create a gzip from string
  // const { res, data } = await dockerAPI(this.prefix + '/archive', 'PUT')
  // }
}
