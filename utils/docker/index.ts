import http from 'http';

const socketPath = '/var/run/docker.sock';

interface Response {
  body: string;
  statusCode?: number;
}

/**
 * Create a request to the docker engine is the current machine
 *
 * Docker Engine API docs:
 *    https://docs.docker.com/reference/api/engine/v1.46/
 */
export default function dockerAPI(
  path: string,
  method = 'GET',
  cb?: (req: http.ClientRequest) => void,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const req = http.request({ socketPath, path, method }, (res) => {
      let body = '';
      res.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      res.on('end', () => resolve({ body, statusCode: res.statusCode }));
    });
    req.on('error', reject);
    if (cb) cb(req);
    else req.end();
  });
}

export async function dockerPull(image: string) {
  const data = await dockerAPI(`/images/create?fromImage=${image}`, 'POST');
  return data;
}
