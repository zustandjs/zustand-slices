## Introduction

As your Zustand store grows with time and new features, it can become challenging to manage. Within this context, the [slices pattern](https://docs.pmnd.rs/zustand/guides/slices-pattern) proves beneficial for enhancing modularity and facilitating maintenance. By dividing your main store into smaller individual slices you can easily group similar values and actions together without losing the ability to eventually combine them into a unified store interface.

Despite its benefits, implementing the slices pattern can often be challenging for users.

zustand-slices addresses this issue by providing a utility that aims to simplify the creation and use of slices, promoting better code organization and maintainability. Moreover, it offers straightforward type definitions for a more robust development experience.

You can explore a live codesandbox.io demo [here](https://codesandbox.io/s/github/zustandjs/zustand-slices/tree/main/examples/01_counter).

## Installation

zustand-slices is available as a package on NPM for use:

```bash
npm install zustand zustand-slices
```

## Usage

The following concepts consist the core functionality of zustand-slices:

- [createSlice](../guides/01_create-slice.md): Create slices to organize your state
- [withSlices](../guides/02_combine-slices-into-single-store.md): Combine slices into a unified store
- [withActions](../guides/03_attaching-store-level-actions.md): Attach store-level actions, in addition to slice-level actions

### First, create your slices

To begin, create individual slices to group related data and actions.

```jsx
import { create } from 'zustand';
import { createSlice, withSlices } from 'zustand-slices';

const countSlice = createSlice({
  name: 'count',
  value: 0,
  actions: {
    inc: () => (prev) => prev + 1,
    resetCount: () => () => 0,
  },
});

const textSlice = createSlice({
  name: 'text',
  value: 'Hello',
  actions: {
    updateText: (newText: string) => () => newText,
    resetText: () => () => 'Hello',
  },
});
```

### Combine them into a single store

By utilizing `create` from Zustand, you can combine these slices into a single store.

```jsx
const useCountStore = create(withSlices(countSlice, textSlice));
```

### Easily utilize it in your components

Finally, you can seamlessly integrate and access your store directly into your component logic utilizing the `useCountStore` hook.

```jsx
const Counter = () => {
  const count = useCountStore((state) => state.count);
  const text = useCountStore((state) => state.text);
  const { inc, updateText, reset } = useCountStore.getState();
  return (
    <>
      <p>
        Count: {count}
        <button type="button" onClick={inc}>
          +1
        </button>
      </p>
      <p>
        <input value={text} onChange={(e) => updateText(e.target.value)} />
      </p>
      <p>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </p>
    </>
  );
};
```

## TypeScript ready

With zustand-slices, you get straightforward type definitions out of the box, seamlessly integrating them into your TypeScript projects. By using the outlined example slices provided above, your store type will be inferred as follows:

```ts
type CountTextState = {
  count: number;
  inc: () => void;
  text: string;
  updateText: (newText: string) => void;
  reset: () => void;
};
```
