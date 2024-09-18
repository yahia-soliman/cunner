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
  body?: unknown,
  opts?: http.RequestOptions,
): Promise<{ res: http.IncomingMessage; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request({ socketPath, path, method, ...opts }, (res) => {
      let body = '';
      res.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      res.on('end', () => resolve({ res, body }));
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

export async function dockerPull(image: string) {
  const data = await dockerAPI(`/images/create?fromImage=${image}`, 'POST');
  return data;
}
