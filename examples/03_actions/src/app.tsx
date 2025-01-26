import { create } from 'zustand';
import { createSlice, withSlices, withActions } from 'zustand-slices';

const countSlice = createSlice({
  name: 'count',
  value: 0,
  actions: {
    incCount: () => (prev) => prev + 1,
    setCount: (newCount: number) => () => newCount,
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

const useCountStore = create(
  withActions(withSlices(countSlice, textSlice), {
    reset: () => (state) => {
      state.resetCount();
      state.resetText();
    },
    setCountWithTextLength: () => (state) => {
      state.setCount(state.text.length);
    },
  }),
);

const Counter = () => {
  const count = useCountStore((state) => state.count);
  const text = useCountStore((state) => state.text);
  const { incCount, updateText, reset, setCountWithTextLength } =
    // eslint-disable-next-line react-compiler/react-compiler
    useCountStore.getState();
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
      <p>
        <button type="button" onClick={setCountWithTextLength}>
          Set Text Length to Count
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
