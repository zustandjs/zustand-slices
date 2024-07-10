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
      text: 'First',
    },
    actions: {
      increment: () => (prev) => {
        prev.count += 1;
      },
      setText: (payload: { newText: string }) => (prev) => {
        prev.text = payload.newText;
      },
      reset: () => () => {
        return {
          count: 0,
          text: 'First',
        };
      },
    },
  });
  const result = createSliceWithImmer(immerSlice);

  // should not be equal as createSliceWithImmer should wrap actions in `produce`
  expect(result.actions.increment).not.toBe(immerSlice.actions.increment);

  expect(result.name).toEqual(immerSlice.name);
  expect(result.value).toEqual(immerSlice.value);

  expect(typeof result.actions.increment).toBe('function');

  const incrementedState = result.actions.increment()(result.value);
  const newTextState = result.actions.setText({ newText: 'Second' })(result.value);
  const resetState = result.actions.reset()(result.value);

  expect(incrementedState.count).toBe(1);
  expect(newTextState.text).toBe('Second');
  expect(resetState).toEqual({ count: 0, text: 'First' });
});
