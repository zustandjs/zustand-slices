import { create } from 'zustand';
import { withSlices } from 'zustand-slices';
import { createSliceWithImmer } from 'zustand-slices/immer';

const countSlice = createSliceWithImmer({
  name: 'count',
  value: {
    count: 0
  },
  actions: {
    inc: () => (state) => {
      state.count += 1;
    },
    reset: () => () => ({ count: 0 }),
    },
});

const textSlice = createSliceWithImmer({
  name: 'text',
  value: 'Hello',
  actions: {
    updateText: (newText: string) => () => newText,
    reset: () => () => 'Hello',
  },
});

const useCountStore = create(withSlices(countSlice, textSlice));

const Counter = () => {
  const { count } = useCountStore((state) => state.count);
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

const App = () => (
  <div>
    <Counter />
  </div>
);

export default App;
