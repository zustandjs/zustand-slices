## Collision handling

Implementing the slices pattern can introduce the risk of name or action collisions, which can lead to confusion and potential errors in your code. For this purpose, efforts have been made to effectively address this issue, both on names and action level.

While zustand-slices currently doesn't throw errors for name collisions, using TypeScript is highly recommended. This allows for robust type-level detection of potential conflicts. The following sections present in detail the way collisions are handled in `withSlices` and `withActions` utilities.

## withSlices

### Slice names

Collisions on slice names occur if they are shared within multiple slices. This includes avoiding conflicts with other slice and action names. As presented in the example below, `countSlice` and `anotherCountSlice` share the same name `count`, which causes the `combinedConfig` to be typed as `never`.

```js
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

const combinedConfig = withSlices(countSlice, anotherCountSlice);
//        ^? const combinedConfig: never
const useCountStore = create(combinedConfig);
//        ^? const useCountStore: UseBoundStore<StoreApi<unknown>>
```

Using a slice name as an action name would result to the same outcome:

```js
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

const combinedConfig = withSlices(countSlice, anotherCountSlice);
//        ^? const combinedConfig: never
const useCountStore = create(combinedConfig);
//        ^? const useCountStore: UseBoundStore<StoreApi<unknown>>
```

### Actions

An action name can be shared across different slices as long as the action parameters remain consistent. However, when the same action name, like `inc` in the following example, is defined with different arguments in different slices, it leads to a collision.

```js
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

const combinedConfig = withSlices(countSlice, anotherCountSlice);
//        ^? const combinedConfig: never
const useCountStore = create(combinedConfig);
//        ^? const useCountStore: UseBoundStore<StoreApi<unknown>>
```

## withActions

When using `withActions`, the provided action names are checked compared to store names to prevent conflicts. This means that the additional store-level action names must be unique – they can't be the same as existing store-level slice or action names.

```js
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

//        ^? const combinedConfig: never
const combinedConfig = withActions(withSlices(countSlice, textSlice), {
  inc: () => (state) => {
    state.set(state.count + 1);
  },
  count: () => (state) => {
    state.set(state.text.length);
  },
});

const useCountStore = create(combinedConfig);
//        ^? const useCountStore: UseBoundStore<StoreApi<unknown>>
```
