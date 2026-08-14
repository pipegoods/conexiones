import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatPhoneDisplay, normalizePhoneInput } from './phone';
import { normalizePhone } from './validations';

describe('normalizePhoneInput', () => {
  it('keeps only digits and strips country code overflow', () => {
    assert.equal(normalizePhoneInput('+57 300 123 4567'), '3001234567');
    assert.equal(normalizePhoneInput('573001234567'), '3001234567');
  });
});

describe('formatPhoneDisplay', () => {
  it('formats a full mobile number in groups of 3-3-4', () => {
    assert.equal(formatPhoneDisplay('3001234567'), '300 123 4567');
  });
});

describe('normalizePhone', () => {
  it('accepts Colombian mobile numbers only', () => {
    assert.equal(normalizePhone('300 123 4567'), '+573001234567');
    assert.equal(normalizePhone('6012345678'), null);
  });
});
