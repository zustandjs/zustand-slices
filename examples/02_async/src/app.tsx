/// <reference types="react/canary" />

import { create } from 'zustand';
import { createSlice, withSlices } from 'zustand-slices';
import { use } from 'react';

const countSlice = createSlice({
  name: 'count',
  value: Promise.resolve(0),
  actions: {
    incCount: () => async (prev) => (await prev) + 1,
    resetCount: () => async () => 0,
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

const useCountStore = create(withSlices(countSlice, textSlice));

const Counter = () => {
  const count = use(useCountStore((state) => state.count));
  const text = useCountStore((state) => state.text);
  const { incCount, resetCount, updateText, resetText } =
    useCountStore.getState();
  const reset = () => {
    resetCount();
    resetText();
  };
  return (
    <>
      <p>
        Count: {count}
        <button type="button" onClick={incCount}>
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

const App = () => (
  <div>
    <Counter />
  </div>
);

export default App;
