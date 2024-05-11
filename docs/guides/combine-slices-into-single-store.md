## Combine slices into single store

`withSlices` is a utility that allows you to combine multiple slices into a single Zustand store. By using `withSlices`, you can merge different slices of state, each with its own set of actions, into a unified store.

```jsx
import { create } from 'zustand';
import { createSlice, withSlices } from 'zustand-slices';

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

const useCountStore = create(withSlices(countSlice, textSlice));
```

`withSlices` extracts and incorporates the actions defined within each individual slice, enabling access and utilization of all slice-specific actions from the combined store. Additionally, it provides the ability to simultaneously update multiple slices using a single action. As presented in the code snippet above, the `reset` action can reset both `count` and `text` slices. Finally, the `useCountStore` hook can be utilized in any of your components for accessing the store:

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

Store-level actions can also be attached, in addition to slice-level actions using the `withActions` util. A detailed guide can be found [here](../guides/attaching-store-level-actions.md).

You can also try this example in a codesandbox.io [demo](https://codesandbox.io/s/github/zustandjs/zustand-slices/tree/main/examples/01_counter).
