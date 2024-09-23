import { Language, languages } from '../models/language.model.js';
import * as service from '../services/language.js';

describe('Language Service', () => {
  let timeout: number;
  const doc: Language = {
    name: 'python',
    versions: ['latest'],
    cmd: ['python', 'SOURCE_CODE'],
  };
  const version = '3.10-alpine';

  beforeAll(() => {
    languages.drop();
    timeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
  });

  it('Creates A new Language', async () => {
    const { language, errors } = await service.newLanguage(doc);
    expect(errors.length).toEqual(0);
    expect(language.name).toEqual(doc.name);
    expect(language.created).toBeInstanceOf(Date);
    expect(language.updated).toBeInstanceOf(Date);
    expect(language.versions).toEqual(doc.versions);
    expect(language.cmd).toEqual(doc.cmd);
    expect(language._id).toBeDefined();
    expect(language.created).toEqual(language.updated);
  });

  it('Fails to create a language with the same name', async () => {
    await expectAsync(service.newLanguage(doc)).toBeRejected();
  });

  it('Adds a new version to a language', async () => {
    const newLang = await service.newVersion(doc.name, version);
    expect(newLang.versions).toContain(version);
    expect(newLang.updated).not.toEqual(newLang.created);
  });

  it('Fails to add a version that already exists', async () => {
    await expectAsync(service.newVersion(doc.name, version)).toBeRejected();
  });

  it('Gets all languages', async () => {
    const res = await service.getAll();
    expect(res.length).toBeGreaterThan(0);
  });

  it('Gets a language by name', async () => {
    const res = await service.getByName(doc.name);
    expect(res.name).toEqual(doc.name);
  });

  it('Fails to get a language by name', async () => {
    await expectAsync(service.getByName('notfound')).toBeRejected();
  });

  it('Deletes a version from a language', async () => {
    await service.deleteVersion(doc.name, version);
    const newLang = await service.getByName(doc.name);
    expect(newLang.versions).not.toContain(version);
  });

  it('Fails to delete a version that does not exist', async () => {
    await expectAsync(service.deleteVersion(doc.name, version)).toBeRejected();
  });

  it('Deletes a language', async () => {
    await expectAsync(service.deleteLanguage(doc.name)).toBeResolved();
  });

  afterAll(() => {
    languages.drop();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;
  });
});
