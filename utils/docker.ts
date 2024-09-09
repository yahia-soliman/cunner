import http from 'http';

const socketPath = '/var/run/docker.sock';

/**
 * Create a request to the docker engine is the current machine
 *
 * Docker Engine API docs:
 *    https://docs.docker.com/reference/api/engine/v1.46/
 */
export default function dockerAPI(path: string, method: string = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ socketPath, path, method }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.end();
  });
}
