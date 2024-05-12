## Create slice

`createSlice` allows you to define a slice of state within your Zustand store. With this function, you specify the name of the slice, its initial value, as well as any corresponding actions associated with it. A slice consists of the following components:

- `name`: The identifier of the slice data within the store.
- `value`: The starting value for your slice's data.
- `actions`: Functions that can be utilized in order to update the slice's state. They can receive the current state, along with additional data required to perform the update.

You can create a slice as demonstrated in the following example:

```jsx
import { createSlice } from 'zustand-slices';

const countSlice = createSlice({
  name: 'count',
  value: 0,
  actions: {
    inc: () => (prev) => prev + 1,
    reset: () => () => 0,
  },
});
```

After creating your slices, you can utilize `withSlices` along with `create` from Zustand to combine them into a single store. A detailed guide can be found [here](../guides/02_combine-slices-into-single-store.md).
