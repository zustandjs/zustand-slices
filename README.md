# zustand-slices

[![CI](https://img.shields.io/github/actions/workflow/status/zustandjs/zustand-slices/ci.yml?branch=main)](https://github.com/zustandjs/zustand-slices/actions?query=workflow%3ACI)
[![npm](https://img.shields.io/npm/v/zustand-slices)](https://www.npmjs.com/package/zustand-slices)
[![size](https://img.shields.io/bundlephobia/minzip/zustand-slices)](https://bundlephobia.com/result?p=zustand-slices)
[![discord](https://img.shields.io/discord/627656437971288081)](https://discord.gg/MrQdmzd)

A slice utility for Zustand

## Motivation

Zustand is a very minimal global state library.
It's not designed with slice patterns.
But as it's flexible and unopinionated, users invented some slice patterns.
One of which is described in the official Zustand documentation.
However, it's very tricky if you were to use it with TypeScript.

This library provides an opinionated way for a slice pattern.
It's designed to be TypeScript friendly.

## Install

```bash
npm install zustand zustand-slices
```

## Usage

```jsx
import { create } from 'zustand';
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

const useCountStore = create(withSlices(countSlice, textSlice));

const Counter = () => {
  const count = useCountStore((state) => state.count);
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
```

## Examples

The [examples](examples) folder contains working examples.
You can run one of them with

```bash
PORT=8080 pnpm run examples:01_counter
```

and open <http://localhost:8080> in your web browser.

You can also try them directly:
[01](https://stackblitz.com/github/zustandjs/zustand-slices/tree/main/examples/01_counter)
[02](https://stackblitz.com/edit/vitejs-vite-kxigsw)
[03](https://stackblitz.com/github/zustandjs/zustand-slices/tree/main/examples/03_actions)
[04](https://stackblitz.com/github/zustandjs/zustand-slices/tree/main/examples/04_immer)

<!-- This requires React 19 to be released.
[02](https://stackblitz.com/github/zustandjs/zustand-slices/tree/main/examples/02_async)
-->

## Tweets

- https://twitter.com/dai_shi/status/1780623600766320785
- https://twitter.com/dai_shi/status/1780804319761268820
- https://twitter.com/dai_shi/status/1780955525292982285
- https://twitter.com/dai_shi/status/1781106942724993372
- https://twitter.com/dai_shi/status/1785504766254297436
- https://twitter.com/dai_shi/status/1786568001044750693
- https://x.com/dai_shi/status/1811204918512067047
