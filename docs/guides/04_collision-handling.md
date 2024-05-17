## Collision handling

Implementing the slices pattern can introduce the risk of name or action collisions, which can lead to confusion and potential errors in your code. For this purpose, efforts have been made to effectively address this issue, both on names and action level.

While zustand-slices currently doesn't throw errors for name collisions, using TypeScript is highly recommended. This allows for robust type-level detection of potential conflicts. The following sections present in detail the way collisions are handled in `withSlices` and `withActions` utilities.

## withSlices

### Slice names

Collisions on slice names occur if they are shared within multiple slices. This includes avoiding conflicts with other slice and action names. As presented in the example below, `countSlice` and `anotherCountSlice` share the same name `count`, which results in the parameters of `withSlices` being marked as invalid due to a type error:

```ts
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

//                                                ^? TypeScript error, indicating invalid parameters
const useCountStore = create(withSlices(countSlice, anotherCountSlice));
```

Using a slice name as an action name would result to the same outcome:

```ts
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

//                                                ^? TypeScript error, indicating invalid parameters
const useCountStore = create(withSlices(countSlice, anotherCountSlice););
```

### Actions

An action name can be shared across different slices as long as the action parameters remain consistent. However, when the same action name, like `inc` in the following example, is defined with different arguments in different slices, it leads to a collision.

```ts
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

//                                                ^? TypeScript error, indicating invalid parameters
const useCountStore = create(withSlices(countSlice, anotherCountSlice));
```

## withActions

When using `withActions`, the provided action names are checked compared to store names to prevent conflicts. This means that the additional store-level action names must be unique – they can't be the same as existing store-level slice or action names.

```ts
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

const useCountStore = create(
  withActions(
    withSlices(countSlice, textSlice),
    // ^? TypeScript error, indicating invalid object
    {
      inc: () => (state) => {
        state.set(state.count + 1);
      },
      count: () => (state) => {
        state.set(state.text.length);
      },
    },
  ),
);
```
