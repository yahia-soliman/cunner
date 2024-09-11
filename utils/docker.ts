import http from 'http';

const socketPath = '/var/run/docker.sock';

/**
 * Create a request to the docker engine is the current machine
 *
 * Docker Engine API docs:
 *    https://docs.docker.com/reference/api/engine/v1.46/
 */
export default function dockerAPI(
  path: string,
  method = 'GET',
  data?: object,
): Promise<{res: http.IncomingMessage, body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request({ socketPath, path, method }, (res) => {
      let body = '';
      res.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      res.on('end', () => resolve({ res, body }));
    });

    req.on('error', reject);
    if (data) {
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

export async function dockerPull(image: string) {
  const data = await dockerAPI(`/images/create?fromImage=${image}`, 'POST');
  return data;
}


export interface ContainerRunOpts {
  Image?: string;
  Cmd?: string[];
}

export class Container {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  /** Create a container */
  static async create(options: ContainerRunOpts): Promise<Container | null> {
    const res = await dockerAPI(`/containers/create`, 'POST', options);
    const { Id } = JSON.parse(res.body);
    if (Id) {
      return new Container(Id);
    }
    return null;
  }

  /** Start the container */
  async start(wait = false) {
    const res = await dockerAPI(`/containers/${this.id}/start`, 'POST');
    if (wait) await this.wait();
    return res;
  }

  /** Wait for the container to exit */
  async wait() {
    return await dockerAPI(`/containers/${this.id}/wait`, 'POST');
  }

  /** Get the logs from a container */
  async logs() {
    return await dockerAPI(`/containers/${this.id}/logs?stdout=1`);
  }

  /** Delete the container */
  async remove() {
    return await dockerAPI(`/containers/${this.id}`, 'DELETE');
  }

  /** Get a tar archive of a `path` in the container */
  // async download(options) { }

  /** Upload data to a file inside the container */
  // async upload(options) { }
}
