import dockerAPI from './utils/docker/index.js';

const data = await dockerAPI('/containers/json');

console.log(data);
