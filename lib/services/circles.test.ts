import { describe, expect, it } from 'vitest';

import { CircleValidationError } from './circles';

describe('circles service', () => {
  it('exports CircleValidationError', () => {
    const err = new CircleValidationError('test');
    expect(err.name).toBe('CircleValidationError');
    expect(err.message).toBe('test');
  });
});
