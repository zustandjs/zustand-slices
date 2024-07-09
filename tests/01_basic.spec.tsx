import { expect, test } from 'vitest';
import { create } from 'zustand';
import { createSlice, withSlices } from 'zustand-slices';
import { createSliceWithImmer } from 'zustand-slices/immer';

test('should export functions', () => {
  expect(createSlice).toBeDefined();
  expect(createSliceWithImmer).toBeDefined();
  expect(withSlices).toBeDefined();
});

test('createSlice', () => {
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

test('withSlices', () => {
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
