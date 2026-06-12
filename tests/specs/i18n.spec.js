import { describe, it, expect } from '../assert.js';
import { translations } from '../../js/i18n.js';

describe('i18n completeness', () => {
  it('should have matching keys in en and zh', () => {
    const enKeys = Object.keys(translations.en).sort();
    const zhKeys = Object.keys(translations.zh).sort();

    // Check English to Chinese
    for (const key of enKeys) {
      if (!zhKeys.includes(key)) {
        throw new Error(`Translation key "${key}" is missing in "zh" locale`);
      }
    }

    // Check Chinese to English
    for (const key of zhKeys) {
      if (!enKeys.includes(key)) {
        throw new Error(`Translation key "${key}" is missing in "en" locale`);
      }
    }
  });

  it('should not have empty translation strings', () => {
    for (const lang of ['en', 'zh']) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(typeof value === 'string').toBeTruthy();
        if (value.trim().length === 0) {
          throw new Error(`Translation key "${key}" in "${lang}" is empty`);
        }
      }
    }
  });
});
