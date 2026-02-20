import { describe, expect, it } from 'vitest';
import { formatTimestampToDateString } from '../../src/utils/date-formatter';

describe('date-formatter', () => {
  it('should format timestamp to UK date string', () => {
    const result = formatTimestampToDateString('2026-02-19T00:00:00.000Z');
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('should format different date correctly', () => {
    const result = formatTimestampToDateString('2026-12-25T10:30:00.000Z');
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('should handle ISO string dates', () => {
    const result = formatTimestampToDateString('2026-03-15');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});
