import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { matchesSearchText, normalizeSearchText } from './search-text';

describe('normalizeSearchText', () => {
  it('removes accents and lowercases', () => {
    assert.equal(normalizeSearchText('Boyacá'), 'boyaca');
    assert.equal(normalizeSearchText('  Quindío '), 'quindio');
  });
});

describe('matchesSearchText', () => {
  it('matches accent-insensitive partial labels', () => {
    assert.equal(matchesSearchText('Archipiélago de San Andrés, Providencia y Santa Catalina', 'san andres'), true);
    assert.equal(matchesSearchText('Bogotá D.C.', 'bogota'), true);
    assert.equal(matchesSearchText('Valle del Cauca', 'narino'), false);
  });

  it('returns all options when the query is empty', () => {
    assert.equal(matchesSearchText('Antioquia', ''), true);
  });
});
