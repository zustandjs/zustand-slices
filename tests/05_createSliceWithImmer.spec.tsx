import { expect, test } from 'vitest';
import { createSliceWithImmer } from 'zustand-slices/immer';

test('should export functions', () => {
  expect(createSliceWithImmer).toBeDefined();
});

test('createSliceWithImmer', () => {
  const immerSlice = createSliceWithImmer({
    name: 'counter',
    value: {
      count: 0,
    },
    actions: {
      increment: () => (prev) => {
        prev.count += 1;
      },
    },
  });
  const result = createSliceWithImmer(immerSlice);

  // should not be equal as createSliceWithImmer should wrap actions in `produce`
  expect(result.actions.increment).not.toBe(immerSlice.actions.increment);

  expect(result.name).toEqual(immerSlice.name);
  expect(result.value).toEqual(immerSlice.value);

  expect(typeof result.actions.increment).toBe('function');
});
