import { describe, it, expect } from '../assert.js';
import { loadContent, saveToLocalStorage, clearCache, getTheme, setTheme } from '../../js/storage.js';
import { getGitHubSettings, saveGitHubSettings } from '../../js/github.js';

describe('Storage Module', () => {
  it('should successfully save and load content from localStorage', () => {
    clearCache();
    
    const testData = {
      site: { name: 'Test Wiki', theme: 'dark' },
      pages: [{ id: 'p1', title: 'Test Page', blocks: [] }]
    };

    const saveSuccess = saveToLocalStorage(testData);
    expect(saveSuccess).toBeTruthy();

    const stored = JSON.parse(localStorage.getItem('teamflow_content'));
    expect(stored.site.name).toBe('Test Wiki');
    expect(stored.pages[0].title).toBe('Test Page');
  });

  it('should fallback to default or fetched content on corrupted cached JSON', async () => {
    // Write corrupted JSON into storage
    localStorage.setItem('teamflow_content', 'invalid-json-{');

    // loadContent should handle JSON.parse exception and fallback to fetching or default
    const content = await loadContent();
    expect(content).toBeTruthy();
    expect(typeof content.site).toBe('object');
    expect(Array.isArray(content.pages)).toBeTruthy();
  });

  it('should save and retrieve theme preferences', () => {
    localStorage.removeItem('teamflow_theme');
    
    expect(getTheme()).toBe('light'); // default

    setTheme('dark');
    expect(getTheme()).toBe('dark');

    setTheme('light');
    expect(getTheme()).toBe('light');
  });

  it('should save and load GitHub settings config + token inside teamflow_github', () => {
    localStorage.removeItem('teamflow_github');

    const defaults = getGitHubSettings();
    expect(defaults.owner).toBe('');
    expect(defaults.repo).toBe('');
    expect(defaults.branch).toBe('main');
    expect(defaults.token).toBe('');

    const newSettings = {
      owner: 'test-owner',
      repo: 'test-repo',
      branch: 'dev',
      token: 'ghp_secret123'
    };

    saveGitHubSettings(newSettings);

    const loaded = getGitHubSettings();
    expect(loaded.owner).toBe('test-owner');
    expect(loaded.repo).toBe('test-repo');
    expect(loaded.branch).toBe('dev');
    expect(loaded.token).toBe('ghp_secret123');
  });
});
