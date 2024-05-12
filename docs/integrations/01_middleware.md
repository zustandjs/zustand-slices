## Middleware

zustand-slices seamlessly integrates with Zustand middleware. The following example demonstrates how you can leverage `persist` and `devtools` utilities from `zustand/middleware`. This allows for persisting the store in local storage, as well as inspecting it through Redux dev tools.

You can try a live demo [here](https://t.co/7AognoqHWV).

```js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
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

const useCountStore = create(
  devtools(persist(withSlices(countSlice, textSlice), { name: 'foo' }))
);
```
