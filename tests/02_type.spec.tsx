import { test, describe } from 'vitest';
import { expectType } from 'ts-expect';
import type { TypeEqual } from 'ts-expect';

import { createSlice, withSlices, withActions } from 'zustand-slices';
import { create } from 'zustand';

describe('createSlice', () => {
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
});

describe('withSlices', () => {
  test('slice type, no collisions', () => {
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

    type CountTextState = {
      count: number;
      inc: () => void;
      text: string;
      updateText: (newText: string) => void;
      reset: () => void;
    };

    const slices = withSlices(countSlice, textSlice);

    expectType<
      (
        set: (
          fn: (prevState: CountTextState) => Partial<CountTextState>,
        ) => void,
      ) => CountTextState
    >(slices);

    expectType<TypeEqual<typeof slices, never>>(false);
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
    // @ts-expect-error invalid configs
    withSlices(countSlice, anotherCountSlice);
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
    // @ts-expect-error invalid configs
    withSlices(countSlice, anotherCountSlice);
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
    // @ts-expect-error invalid configs
    withSlices(countSlice, anotherCountSlice);
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
    // @ts-expect-error invalid configs
    withSlices(countSlice, anotherCountSlice);
    // @ts-expect-error invalid configs
    withSlices(anotherCountSlice, countSlice);
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
    // @ts-expect-error invalid configs
    withSlices(countSlice, anotherCountSlice);
    // @ts-expect-error invalid configs
    withSlices(anotherCountSlice, countSlice);
  });
});

describe('withActions', () => {
  test('slice type, no collisions', () => {
    const countSlice = createSlice({
      name: 'count',
      value: 0,
      actions: {
        inc: () => (state) => state + 1,
        set: (newCount: number) => () => newCount,
      },
    });

    const textSlice = createSlice({
      name: 'text',
      value: 'Hello',
      actions: {
        updateText: (text: string) => () => text,
      },
    });

    type CountTextState = {
      count: number;
      inc: () => void;
      set: (newCount: number) => void;
      text: string;
      updateText: (newText: string) => void;
      anotherInc: () => void;
    };

    expectType<
      (
        set: (
          fn: (prevState: CountTextState) => Partial<CountTextState>,
        ) => void,
        get: () => CountTextState,
      ) => CountTextState
    >(
      withActions(withSlices(countSlice, textSlice), {
        anotherInc: () => (state) => {
          state.set(state.count + 1);
        },
      }),
    );
  });

  test('name collisions: slice names', () => {
    const countSlice = createSlice({
      name: 'count',
      value: 0,
      actions: {
        inc: () => (state) => state + 1,
        set: (newCount: number) => () => newCount,
      },
    });

    const textSlice = createSlice({
      name: 'text',
      value: 'Hello',
      actions: {
        updateText: (text: string) => () => text,
      },
    });

    // @ts-expect-error invalid actions
    withActions(withSlices(countSlice, textSlice), {
      count: () => (state) => {
        state.set(state.text.length);
      },
    });

    // @ts-expect-error invalid actions
    withActions(withSlices(countSlice, textSlice), {
      count: () => (state) => {
        state.set(state.text.length);
      },
      text: () => (state) => {
        state.updateText('Hello world');
      },
    });
  });

  test('name collisions: action names', () => {
    const countSlice = createSlice({
      name: 'count',
      value: 0,
      actions: {
        inc: () => (state) => state + 1,
        set: (newCount: number) => () => newCount,
      },
    });

    const textSlice = createSlice({
      name: 'text',
      value: 'Hello',
      actions: {
        updateText: (text: string) => () => text,
      },
    });

    // @ts-expect-error invalid actions
    withActions(withSlices(countSlice, textSlice), {
      inc: () => (state) => {
        state.set(state.count + 1);
      },
    });

    // @ts-expect-error invalid actions
    withActions(withSlices(countSlice, textSlice), {
      inc: () => (state) => {
        state.set(state.count + 1);
      },
      updateText: () => (state) => {
        state.updateText('Hello World');
      },
    });
  });

  test('name collisions: action and slice names', () => {
    const countSlice = createSlice({
      name: 'count',
      value: 0,
      actions: {
        inc: () => (state) => state + 1,
        set: (newCount: number) => () => newCount,
      },
    });

    const textSlice = createSlice({
      name: 'text',
      value: 'Hello',
      actions: {
        updateText: (text: string) => () => text,
      },
    });

    // @ts-expect-error invalid actions
    withActions(withSlices(countSlice, textSlice), {
      inc: () => (state) => {
        state.set(state.count + 1);
      },
      updateText: () => (state) => {
        state.updateText('Hello World');
      },
      count: () => (state) => {
        state.set(state.text.length);
      },
      text: () => (state) => {
        state.updateText('Hello world');
      },
    });
  });
});

describe('create', () => {
  test('name collisions', () => {
    const countSlice = createSlice({
      name: 'count',
      value: 0,
      actions: {},
    });
    const anotherCountSlice = createSlice({
      name: 'count',
      value: 0,
      actions: {},
    });
    // @ts-expect-error invalid configs
    create(withSlices(countSlice, anotherCountSlice));

    create(
      // @ts-expect-error invalid configs
      withActions(withSlices(countSlice, anotherCountSlice), {
        anotherCount: () => () => {},
      }),
    );

    create(
      withActions(
        // @ts-expect-error invalid configs
        withSlices(countSlice, anotherCountSlice),
        // @ts-expect-error invalid actions
        {
          count: () => (state) => state.count,
        },
      ),
    );
  });
});
