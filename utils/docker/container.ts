import dockerAPI from './index.js';
import { pack } from 'tar-stream';

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
    const res = await dockerAPI('/containers/create', 'POST', (req) => {
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(options), (err) => {
        if (err) throw err;
        req.end();
      });
    });
    const body = JSON.parse(res.body);
    if (body.Id) {
      return new Container(body.Id);
    }
    throw new Error('Cannot Create a container');
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
  async writeFile(name: string, content: string, outdir = './') {
    const tar = pack();
    tar.entry({ name }, content, () => tar.finalize());
    return await dockerAPI(
      this.prefix + `/archive?path=${outdir}`,
      'PUT',
      (req) => {
        req.setHeader('Content-Type', 'application/x-tar');
        tar.pipe(req, { end: true });
      },
    );
  }
}
