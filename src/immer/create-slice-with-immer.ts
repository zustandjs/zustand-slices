import { produce } from 'immer';
import type { Draft } from 'immer';

// Utility type to infer the argument types of the actions
type InferArgs<T> = T extends (...args: infer A) => void ? A : never;

type SliceActions<Value> = {
  [actionName: string]: (
    ...args: never[]
  ) => (draft: Draft<Value>) => Draft<Value> | void;
};

export type SliceConfig<
  Name extends string,
  Value,
  Actions extends SliceActions<Value>,
> = {
  name: Name;
  value: Value;
  actions: Actions;
};

type ImmerActions<Value, Actions extends SliceActions<Value>> = {
  [K in keyof Actions]: (
    ...args: InferArgs<Actions[K]>
  ) => (prev: Value) => Value;
};

export function createSliceWithImmer<
  Name extends string,
  Value,
  Actions extends SliceActions<Value>,
>(config: SliceConfig<Name, Value, Actions>) {
  const immerActions = Object.fromEntries(
    Object.entries(config.actions).map(([actionKey, action]) => [
      actionKey,
      (...args: InferArgs<typeof action>) =>
        (prev: Value) =>
          produce(prev, (draft) => action(...args)(draft)),
    ]),
  ) as unknown as ImmerActions<Value, Actions>;
  return {
    ...config,
    actions: immerActions,
  };
}
