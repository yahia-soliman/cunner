import { Snippet, snippets } from '../models/snippet.model.js';
import * as languageService from '../services/language.js';
import * as service from '../services/snippet.js';

describe('Snippet Service:', () => {
  const doc: Snippet = {
    language: 'python',
    version: '3.8-alpine',
    code: 'print("Hello, World!")',
  };

  beforeAll(async () => {
    await snippets.drop();
    await languageService.newLanguage({
      name: 'python',
      versions: ['3.8-alpine'],
      cmd: ['python3', 'SOURCE_FILE'],
    });
  });

  it('Fails to create a snippet with an unsupported version', async () => {
    await expectAsync(
      service.newSnippet({ ...doc, version: 'hamada' }),
    ).toBeRejected();
  });

  it('Creates a snippet', async () => {
    const res = await service.newSnippet(doc);
    doc._id = res._id;
    expect(res.language).toBe(doc.language);
    expect(res.version).toBe(doc.version);
  });

  it('Fails to get a snippet that does not exist', async () => {
    await expectAsync(service.getById('hamada')).toBeRejected();
  });

  it('Gets a snippet', async () => {
    const res = await service.getById(doc._id as string);
    expect(res.language).toBe(doc.language);
    expect(res.version).toBe(doc.version);
  });

  it('Gets all snippets', async () => {
    const res = await service.allSnippets({});
    expect(res).toEqual([doc]);
  });

  it('Updates a snippet', async () => {
    const res = await service.updateSnippet(doc._id as string, {
      code: 'print("Goodbye, World!")',
    });
    expect(res.code).toBe('print("Goodbye, World!")');
  });

  it('Fails to delete a snippet that does not exist', async () => {
    await expectAsync(service.deleteSnippet('hamada')).toBeRejected();
  });

  it('Deletes a snippet', async () => {
    await expectAsync(service.deleteSnippet(doc._id as string)).toBeResolved();
  });

  afterAll(async () => {
    await snippets.drop();
    await languageService.deleteLanguage('python');
  });
});
