import dockerAPI, { Container, dockerPull } from '../utils/docker.js';

describe('Docker Enginer API connector: dockerAPI function', () => {
  it('GET /containers/json return array', async () => {
    const { body } = await dockerAPI('/containers/json');
    expect(JSON.parse(body)).toBeInstanceOf(Array);
  });
});

describe('Pull image from docker hub: dockerPull', () => {
  const image = 'python:3.7-alpine';
  let timeout: number;
  let container: Container;

  beforeAll(() => {
    timeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
  });

  it('pulls the correct image', async () => {
    const { body } = await dockerPull(image);
    expect(body.includes(image)).toBeTrue();
  });

  it('creates a container', async () => {
    expect(container).toBeUndefined();
    container =
      (await Container.create({
        Image: image,
        Cmd: ['sh', '-c', 'python3 <<EOF\nprint("Hello There!\\nboi")\nEOF'],
      })) || container;
    expect(container).not.toBeNull();
  });

  it('starts the container', async () => {
    expect(container).not.toBeNull();
    const { res } = await container.start();
    expect(res.statusCode).toBe(204);
  });

  it('waits for the container to exit', async () => {
    expect(container).not.toBeNull();
    const { res } = await container.wait();
    expect(res.statusCode).toBe(200);
  });

  it('gets the logs', async () => {
    const { body } = await container.logs();
    expect(body).toContain('Hello There!');
  });

  it('deletes the container', async () => {
    const { res } = await container.remove();
    expect(res.statusCode).toBe(204);
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;
  });
});
