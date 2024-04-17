import { createSlice, withSlices } from '../src/index';

describe('basic spec', () => {
  it('should export functions', () => {
    expect(createSlice).toBeDefined();
    expect(withSlices).toBeDefined();
  });
});
