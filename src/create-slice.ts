type SliceActions<Value> = {
  [actionName: string]: (...args: never[]) => (prev: Value) => Value;
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

export function createSlice<
  Name extends string,
  Value,
  Actions extends SliceActions<Value>,
>(config: SliceConfig<Name, Value, Actions>) {
  return config;
}
