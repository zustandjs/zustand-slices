import { expectType } from 'ts-expect';
import type { TypeEqual } from 'ts-expect';

import { createSlice, withSlices } from '../src/index';

describe('type spec', () => {
  it('single slice', () => {
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

  it('detect name collisions', () => {
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

  it('detect name collisions with actions', () => {
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

  it('detect args collisions', () => {
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

  it('no args collisions', () => {
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

  it('detect args collisions (overload case)', () => {
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
});
