import { describe, expect, it } from 'vitest';
import { create } from 'zustand';
import { createSlice, withSlices } from 'zustand-slices';

describe('basic spec', () => {
  it('should export functions', () => {
    expect(createSlice).toBeDefined();
    expect(withSlices).toBeDefined();
  });
  describe('createSlice', () => {
    it('should return a slice config', () => {
      const slice = createSlice({
        name: 'counter',
        value: 0,
        actions: {
          increment: () => (prev) => prev + 1,
        },
      });
      // returns the input
      expect(createSlice(slice)).toBe(slice);
    });
  });
  describe('withSlices', () => {
    it('should combine slices and nest state', () => {
      const countSlice = createSlice({
        name: 'count',
        value: 0,
        actions: {
          inc: () => (prev) => prev + 1,
          reset: () => () => 0,
        },
      });

      const textSlice = createSlice({
        name: 'text',
        value: 'Hello',
        actions: {
          updateText: (newText: string) => () => newText,
          reset: () => () => 'Hello',
        },
      });

      const combinedConfig = withSlices(countSlice, textSlice);

      expect(combinedConfig).toBeInstanceOf(Function);

      const store = create(combinedConfig);

      const state = store.getState();

      expect(state.count).toBe(countSlice.value);
      expect(state.text).toBe(textSlice.value);

      expect(state.inc).toBeInstanceOf(Function);
      expect(state.reset).toBeInstanceOf(Function);
      expect(state.updateText).toBeInstanceOf(Function);
    });
  });
});
