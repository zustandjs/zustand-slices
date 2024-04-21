import { afterEach, describe, expect, it } from 'vitest';
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { create, useStore as useZustandStore } from 'zustand';
import type { StoreApi } from 'zustand';
import { cleanup, render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createSlice, withSlices } from 'zustand-slices';

type ExtractState<S> = S extends {
  getState: () => infer State;
}
  ? State
  : never;

function createZustandContext<Store extends StoreApi<unknown>>(
  makeStore: () => Store,
) {
  const Context = createContext<Store | undefined>(undefined);
  const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [store] = useState(makeStore);
    return <Context.Provider value={store}>{children}</Context.Provider>;
  };
  function useStore() {
    const store = useContext(Context);
    if (!store) {
      throw new Error('useStore must be used within a StoreProvider');
    }
    return store;
  }
  function useSelector<Selected>(
    selector: (state: ExtractState<Store>) => Selected,
  ) {
    const store = useStore();
    return useZustandStore(store, selector);
  }
  return { StoreProvider, useStore, useSelector };
}

const countSlice = createSlice({
  name: 'count',
  value: 0,
  actions: {
    inc: () => (state) => state + 1,
    reset: () => () => 0,
  },
});

const textSlice = createSlice({
  name: 'text',
  value: 'Hello',
  actions: {
    updateText: (text: string) => () => text,
    reset: () => () => 'Hello',
  },
});

const makeStore = () => create(withSlices(countSlice, textSlice));

const { StoreProvider, useStore, useSelector } =
  createZustandContext(makeStore);

const renderWithProvider = (
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: StoreProvider, ...options });

const Counter = () => {
  const count = useSelector((state) => state.count);
  const { inc } = useStore().getState();
  return (
    <div>
      <p data-testid="count">{count}</p>
      <button type="button" onClick={inc}>
        Increment
      </button>
    </div>
  );
};

const Text = () => {
  const text = useSelector((state) => state.text);
  const { updateText } = useStore().getState();
  return (
    <div>
      <input value={text} onChange={(e) => updateText(e.target.value)} />
    </div>
  );
};

const App = () => {
  const { reset } = useStore().getState();
  return (
    <div>
      <Counter />
      <Text />
      <button type="button" onClick={reset}>
        Reset
      </button>
    </div>
  );
};

describe('component spec', () => {
  const user = userEvent.setup();
  afterEach(cleanup);
  it('should render the app', () => {
    const { getByRole, getByTestId } = renderWithProvider(<App />);
    expect(getByTestId('count')).toHaveTextContent('0');
    expect(getByRole('textbox')).toBeInTheDocument();
  });
  it('should increment the count when the button is pressed', async () => {
    const { getByRole, getByTestId } = renderWithProvider(<App />);

    const count = getByTestId('count');
    expect(count).toHaveTextContent('0');

    const button = getByRole('button', { name: 'Increment' });
    await user.click(button);

    expect(count).toHaveTextContent('1');
  });
  it('should update the text when the input is changed', async () => {
    const { getByRole } = renderWithProvider(<App />);

    const input = getByRole('textbox');
    expect(input).toHaveValue('Hello');

    await user.type(input, ' World');

    expect(input).toHaveValue('Hello World');
  });
  it('should reset the state when the reset button is pressed', async () => {
    const { getByRole, getByTestId } = renderWithProvider(<App />);

    const resetButton = getByRole('button', { name: 'Reset' });

    const count = getByTestId('count');
    expect(count).toHaveTextContent('0');

    const incrementButton = getByRole('button', { name: 'Increment' });
    await user.click(incrementButton);
    expect(count).toHaveTextContent('1');

    const input = getByRole('textbox');
    await user.type(input, ' World');
    expect(input).toHaveValue('Hello World');

    await user.click(resetButton);

    // both slices reset because the action name is the same
    expect(count).toHaveTextContent('0');
    expect(input).toHaveValue('Hello');
  });
});
