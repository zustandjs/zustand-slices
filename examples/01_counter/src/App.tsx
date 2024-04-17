import { create } from 'zustand';
import { createSlice, withSlices } from 'zustand-slices';

const countSlice = createSlice({
  name: 'count',
  value: 0,
  actions: {
    inc: () => (prev) => prev + 1,
    addBy: (n: number) => (prev) => prev + n,
  },
});

const textSlice = createSlice({
  name: 'text',
  value: 'Hello',
  actions: {
    updateText: (newText: string) => () => newText,
  },
});

const useCountStore = create(withSlices(countSlice, textSlice));

const Counter = () => {
  const count = useCountStore((state) => state.count);
  const inc = useCountStore((state) => state.inc);
  const addBy = useCountStore((state) => state.addBy);
  const text = useCountStore((state) => state.text);
  const updateText = useCountStore((state) => state.updateText);
  return (
    <>
      <div>Count: {count}</div>
      <button type="button" onClick={inc}>
        +1
      </button>
      <button type="button" onClick={() => addBy(10)}>
        +10
      </button>
      <input value={text} onChange={(e) => updateText(e.target.value)} />
    </>
  );
};

const App = () => (
  <div>
    <Counter />
  </div>
);

export default App;
