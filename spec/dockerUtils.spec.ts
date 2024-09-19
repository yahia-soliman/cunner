import dockerAPI, { dockerPull } from '../utils/docker/index.js';
import { Container } from '../utils/docker/container.js';

const image = 'python:3.7-alpine';

describe('Docker Enginer API connector: dockerAPI function', () => {
  let timeout: number;

  beforeAll(() => {
    timeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
  });

  it('GET /containers/json return array', async () => {
    const { body } = await dockerAPI('/containers/json');
    expect(JSON.parse(body)).toBeInstanceOf(Array);
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;
  });
});

describe('Pull image from docker hub: dockerPull', () => {
  it('pulls the correct image', async () => {
    const { body } = await dockerPull(image);
    expect(body.includes(image)).toBeTrue();
  });
});

describe('Container Class:', () => {
  let container: Container;

  it('creates a container', async () => {
    expect(container).toBeUndefined();
    container = await Container.create({
      Image: image,
      Cmd: ['python3', 'test.py'],
    });
    expect(container).not.toBeNull();
  });

  it('writes the code into a file', async () => {
    const res = await container.writeFile('test.py', 'print("Hello There!\\nboi")', './');
    expect(res.statusCode).toBe(200);
  });

  it('starts a container', async () => {
    const { statusCode } = await container.start();
    expect(statusCode).toBe(204);
  });

  it('waits for the container to exit', async () => {
    const { statusCode } = await container.wait();
    expect(statusCode).toBe(200);
  });

  it('gets the logs', async () => {
    const res = await container.logs();
    expect(res.body).toContain('Hello There!');
  });

  it('deletes the container', async () => {
    const { statusCode } = await container.remove();
    expect(statusCode).toBe(204);
  });
});
