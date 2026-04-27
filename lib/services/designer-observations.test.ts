import { describe, expect, it } from 'vitest';

import { DesignerObservationValidationError } from './designer-observations';

describe('designer observations service', () => {
  it('exports DesignerObservationValidationError', () => {
    const err = new DesignerObservationValidationError('test');
    expect(err.name).toBe('DesignerObservationValidationError');
    expect(err.message).toBe('test');
  });
});
