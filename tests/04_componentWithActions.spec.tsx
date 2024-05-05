import { afterEach, expect, test } from 'vitest';
import type { ReactNode } from 'react';
import { create } from 'zustand';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createSlice, withSlices, withActions } from 'zustand-slices';
import createZustandContext from './utils/createZustandContext.js';

const countSlice = createSlice({
  name: 'count',
  value: 0,
  actions: {
    inc: () => (state) => state + 1,
    set: (newCount: number) => () => newCount,
  },
});

const textSlice = createSlice({
  name: 'text',
  value: 'Hello',
  actions: {
    updateText: (text: string) => () => text,
  },
});

const { StoreProvider, useStoreApi, useSelector } = createZustandContext(() =>
  create(
    withActions(withSlices(countSlice, textSlice), {
      setCountWithTextLength: () => (state) => {
        state.set(state.text.length);
      },
    }),
  ),
);

const renderWithStoreProvider = (app: ReactNode) =>
  render(app, { wrapper: StoreProvider });

const Counter = () => {
  const count = useSelector((state) => state.count);
  const { inc } = useStoreApi().getState();
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
  const { updateText } = useStoreApi().getState();
  return (
    <div>
      <input value={text} onChange={(e) => updateText(e.target.value)} />
    </div>
  );
};

const App = () => {
  const { setCountWithTextLength } = useStoreApi().getState();
  return (
    <div>
      <Counter />
      <Text />
      <p data-testid="set-text-length-to-count">
        <button type="button" onClick={setCountWithTextLength}>
          Set Text Length to Count
        </button>
      </p>
    </div>
  );
};

afterEach(cleanup);

test('should render the app', () => {
  renderWithStoreProvider(<App />);
  expect(screen.getByTestId('count')).toHaveTextContent('0');
  expect(screen.getByRole('textbox')).toBeInTheDocument();
  expect(screen.getByTestId('set-text-length-to-count')).toBeInTheDocument();
});

test('should set text length to count', async () => {
  const user = userEvent.setup();
  renderWithStoreProvider(<App />);

  // Increment count
  await user.click(screen.getByRole('button', { name: 'Increment' }));
  expect(screen.getByTestId('count')).toHaveTextContent('1');

  // Change text
  await user.type(screen.getByRole('textbox'), ' World');
  expect(screen.getByRole('textbox')).toHaveValue('Hello World');

  // Set text length to count
  await user.click(
    screen.getByRole('button', { name: 'Set Text Length to Count' }),
  );
  expect(screen.getByTestId('count')).toHaveTextContent('11');
});
