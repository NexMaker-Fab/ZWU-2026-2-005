/**
 * GitHub Module — Manages GitHub API integration for saving content to a repository.
 */

const GITHUB_SETTINGS_KEY = 'teamflow_github';

/**
 * Get saved GitHub settings from sessionStorage
 */
export function getGitHubSettings() {
  const saved = sessionStorage.getItem(GITHUB_SETTINGS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) { /* ignore */ }
  }

  // Also check localStorage for non-token settings
  const persisted = localStorage.getItem(GITHUB_SETTINGS_KEY + '_config');
  if (persisted) {
    try {
      return { ...JSON.parse(persisted), token: '' };
    } catch (e) { /* ignore */ }
  }

  return { owner: '', repo: '', branch: 'main', token: '' };
}

/**
 * Save GitHub settings
 * Token goes to sessionStorage only; owner/repo/branch persist in localStorage
 */
export function saveGitHubSettings(settings) {
  // Token in session only
  sessionStorage.setItem(GITHUB_SETTINGS_KEY, JSON.stringify(settings));

  // Persist non-sensitive settings
  const { token, ...config } = settings;
  localStorage.setItem(GITHUB_SETTINGS_KEY + '_config', JSON.stringify(config));
}

/**
 * Check if GitHub is configured (has token + repo info)
 */
export function isGitHubConfigured() {
  const s = getGitHubSettings();
  return !!(s.owner && s.repo && s.token);
}

/**
 * Save content.json to GitHub repository via the Contents API
 * @param {Object} data - The content data to save
 * @returns {Object} - { success: boolean, message: string }
 */
export async function saveToGitHub(data) {
  const settings = getGitHubSettings();

  if (!settings.owner || !settings.repo || !settings.token) {
    return { success: false, message: 'GitHub settings incomplete. Please configure in Settings.' };
  }

  const filePath = 'data/content.json';
  const apiUrl = `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${filePath}`;

  try {
    // First, get the current file to obtain its SHA (required for updating)
    let sha = null;
    try {
      const getResp = await fetch(apiUrl + `?ref=${settings.branch}`, {
        headers: {
          'Authorization': `Bearer ${settings.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getResp.ok) {
        const fileData = await getResp.json();
        sha = fileData.sha;
      }
    } catch (e) {
      // File might not exist yet, that's OK
    }

    // Encode content to base64
    const content = JSON.stringify(data, null, 2);
    const encoded = btoa(unescape(encodeURIComponent(content)));

    // Create or update the file
    const putBody = {
      message: `Update content via TeamFlow Wiki [${new Date().toLocaleString()}]`,
      content: encoded,
      branch: settings.branch
    };
    if (sha) {
      putBody.sha = sha;
    }

    const putResp = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${settings.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(putBody)
    });

    if (putResp.ok) {
      return { success: true, message: 'Content saved to GitHub successfully!' };
    } else {
      const err = await putResp.json();
      return { success: false, message: `GitHub API error: ${err.message || putResp.statusText}` };
    }
  } catch (e) {
    return { success: false, message: `Network error: ${e.message}` };
  }
}
