import dockerAPI from '../utils/docker.js';

describe('Docker Enginer API connector: dockerAPI function', () => {
  it('GET /containers/json return array', async () => {
    const res = await dockerAPI('/containers/json');
    expect(JSON.parse(res)).toBeInstanceOf(Array);
    expect(1).not.toBeNaN();
  });
});
