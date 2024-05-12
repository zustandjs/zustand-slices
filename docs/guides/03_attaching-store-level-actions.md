## Attaching store-level actions

`withActions` provides the ability to attach store-level actions, in addition to slice-level actions. Furthermore, these actions can utilize individual slice actions.

Once you've defined your slices, simply integrate `withSlices` with `withActions` to merge your additional store-level actions.

```jsx
import { create } from 'zustand';
import { createSlice, withSlices, withActions } from 'zustand-slices';

const countSlice = createSlice({
  name: 'count',
  value: 0,
  actions: {
    'count/inc': () => (prev) => prev + 1,
    'count/set': (newCount: number) => () => newCount,
    reset: () => () => 0,
  },
});

const textSlice = createSlice({
  name: 'text',
  value: 'Hello',
  actions: {
    'text/set': (newText: string) => () => newText,
    reset: () => () => 'Hello',
  },
});

const useCountStore = create(
  withActions(withSlices(countSlice, textSlice), {
    setCountWithTextLength: () => (state) => {
      state['count/set'](state.text.length);
    },
  }),
);
```

`withActions` combines the extracted actions defined within each individual slice with your additional store-level actions. The `useCountStore` hook can then be utilized in any of your components for accessing the store:

```jsx
const Counter = () => {
  const count = useCountStore((state) => state.count);
  const text = useCountStore((state) => state.text);
  const {
    'count/inc': inc,
    'text/set': updateText,
    reset,
    setCountWithTextLength,
  } = useCountStore.getState();
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
      <p>
        <button type="button" onClick={setCountWithTextLength}>
          Set Text Length to Count
        </button>
      </p>
    </>
  );
};
```

Feel free to experiment with this example in a codesandbox.io [demo](https://codesandbox.io/s/github/zustandjs/zustand-slices/tree/main/examples/03_actions).
