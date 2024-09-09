import dockerAPI from './utils/docker.js';

const data = await dockerAPI('/containers/json');

console.log(data);
