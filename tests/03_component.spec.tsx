import { afterEach, expect, test } from 'vitest';
import type { ReactNode } from 'react';
import { create } from 'zustand';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createSlice, withSlices } from 'zustand-slices';
import createZustandContext from './utils/createZustandContext.js';

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

const { StoreProvider, useStoreApi, useSelector } = createZustandContext(() =>
  create(withSlices(countSlice, textSlice)),
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
  const { reset } = useStoreApi().getState();
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

afterEach(cleanup);

test('should render the app', () => {
  renderWithStoreProvider(<App />);
  expect(screen.getByTestId('count')).toHaveTextContent('0');
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});

test('should increment the count when the button is pressed', async () => {
  const user = userEvent.setup();
  renderWithStoreProvider(<App />);
  expect(screen.getByTestId('count')).toHaveTextContent('0');
  await user.click(screen.getByRole('button', { name: 'Increment' }));
  expect(screen.getByTestId('count')).toHaveTextContent('1');
});

test('should update the text when the input is changed', async () => {
  const user = userEvent.setup();
  renderWithStoreProvider(<App />);
  expect(screen.getByRole('textbox')).toHaveValue('Hello');
  await user.type(screen.getByRole('textbox'), ' World');
  expect(screen.getByRole('textbox')).toHaveValue('Hello World');
});

test('should reset the state when the reset button is pressed', async () => {
  const user = userEvent.setup();
  renderWithStoreProvider(<App />);
  expect(screen.getByTestId('count')).toHaveTextContent('0');
  await user.click(screen.getByRole('button', { name: 'Increment' }));
  expect(screen.getByTestId('count')).toHaveTextContent('1');
  await user.type(screen.getByRole('textbox'), ' World');
  expect(screen.getByRole('textbox')).toHaveValue('Hello World');
  await user.click(screen.getByRole('button', { name: 'Reset' }));
  // both slices reset because the action name is the same
  expect(screen.getByTestId('count')).toHaveTextContent('0');
  expect(screen.getByRole('textbox')).toHaveValue('Hello');
});
