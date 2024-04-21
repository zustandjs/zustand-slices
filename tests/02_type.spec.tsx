import { test } from 'vitest';
import { expectType } from 'ts-expect';
import type { TypeEqual } from 'ts-expect';

import { createSlice, withSlices } from 'zustand-slices';

test('slice type: single slice', () => {
  const countSlice = createSlice({
    name: 'count',
    value: 0,
    actions: {
      inc: () => (prev) => prev + 1,
    },
  });
  expectType<
    TypeEqual<
      {
        name: 'count';
        value: number;
        actions: {
          inc: () => (prev: number) => number;
        };
      },
      typeof countSlice
    >
  >(true);
});

test('name collisions: same slice names', () => {
  const countSlice = createSlice({
    name: 'count',
    value: 0,
    actions: {
      inc: () => (prev) => prev + 1,
    },
  });
  const anotherCountSlice = createSlice({
    name: 'count',
    value: 0,
    actions: {
      inc: () => (prev) => prev + 1,
    },
  });
  expectType<never>(withSlices(countSlice, anotherCountSlice));
});

test('name collisions: slice name and action name', () => {
  const countSlice = createSlice({
    name: 'count',
    value: 0,
    actions: {
      inc: () => (prev) => prev + 1,
    },
  });
  const anotherCountSlice = createSlice({
    name: 'anotherCount',
    value: 0,
    actions: {
      count: () => (prev) => prev + 1,
    },
  });
  expectType<never>(withSlices(countSlice, anotherCountSlice));
});

test('name collisions: slice name and action name (overlapping case)', () => {
  const countSlice = createSlice({
    name: 'count',
    value: 0,
    actions: {
      inc: () => (prev) => prev + 1,
    },
  });
  const anotherCountSlice = createSlice({
    name: 'anotherCount',
    value: 0,
    actions: {
      count: () => (prev) => prev + 1,
      dec: () => (prev) => prev - 1,
    },
  });
  expectType<never>(withSlices(countSlice, anotherCountSlice));
});

test('args collisions: different args', () => {
  const countSlice = createSlice({
    name: 'count',
    value: 0,
    actions: {
      inc: (s: string) => (prev) => prev + (s ? 2 : 1),
    },
  });
  const anotherCountSlice = createSlice({
    name: 'anotherCount',
    value: 0,
    actions: {
      inc: (n: number) => (prev) => prev + n,
    },
  });
  expectType<never>(withSlices(countSlice, anotherCountSlice));
  expectType<never>(withSlices(anotherCountSlice, countSlice));
});

test('args collisions: same args', () => {
  const countSlice = createSlice({
    name: 'count',
    value: 0,
    actions: {
      inc: () => (prev) => prev + 1,
    },
  });
  const anotherCountSlice = createSlice({
    name: 'anotherCount',
    value: 0,
    actions: {
      anotherInc: (n: number) => (prev) => prev + n,
    },
  });
  expectType<(...args: never[]) => unknown>(
    withSlices(countSlice, anotherCountSlice),
  );
  expectType<(...args: never[]) => unknown>(
    withSlices(anotherCountSlice, countSlice),
  );
});

test('args collisions: overload case', () => {
  const countSlice = createSlice({
    name: 'count',
    value: 0,
    actions: {
      inc: () => (prev) => prev + 1,
    },
  });
  const anotherCountSlice = createSlice({
    name: 'anotherCount',
    value: 0,
    actions: {
      inc: (n: number) => (prev) => prev + n,
    },
  });
  expectType<never>(withSlices(countSlice, anotherCountSlice));
  expectType<never>(withSlices(anotherCountSlice, countSlice));
});
