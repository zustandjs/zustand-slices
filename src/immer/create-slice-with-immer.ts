import { produce } from 'immer';

// Utility type to infer the argument types of the actions
type InferArgs<T> = T extends (...args: infer A) => void ? A : never;

export type SliceActions<Value> = {
  [actionName: string]: (...args: never[]) => (prev: Value) => void;
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
  [K in keyof Actions]: (...args: InferArgs<Actions[K]>) => (prev: Value) => void;
};

export function createSliceWithImmer<
  Name extends string,
  Value,
  Actions extends SliceActions<Value>,
>(config: SliceConfig<Name, Value, Actions>) {
  const immerActions = Object.keys(config.actions).reduce((acc, actionKey) => {
    const action = config.actions[actionKey as keyof Actions];

    if (action) {
      acc[actionKey as keyof Actions] = ((...args: InferArgs<typeof action>) => (prev: Value) =>
        produce(prev, (draft: Value) => {
          (action as (...args: InferArgs<typeof action>) => (draft: Value) => void)(...args)(draft);
        })) as ImmerActions<Value, Actions>[typeof actionKey];
    }

    return acc;
  }, {} as ImmerActions<Value, Actions>);

  return {
    ...config,
    actions: immerActions,
  };
}
