type ParametersIf<T> = T extends (...args: infer Args) => unknown
  ? Args
  : never;

type SliceConfig<
  Name extends string,
  Value,
  Actions extends {
    [actionName: string]: (...args: never[]) => (prev: Value) => Value;
  },
> = {
  name: Name;
  value: Value;
  actions: Actions;
};

type InferState<Configs> = Configs extends [
  SliceConfig<infer Name, infer Value, infer Actions>,
  ...infer Rest,
]
  ? { [name in Name]: Value } & {
      [actionName in keyof Actions]: (
        ...args: Parameters<Actions[actionName]>
      ) => void;
    } & InferState<Rest>
  : unknown;

type InferStateNames<Configs> = Configs extends [
  SliceConfig<infer Name, infer Value, infer _Actions>,
  ...infer Rest,
]
  ? { [name in Name]: Value } & InferStateNames<Rest>
  : unknown;

type IsDuplicated<PrevConfigs, Config> =
  Config extends SliceConfig<infer Name, infer _Value, infer Actions>
    ? Extract<keyof InferState<PrevConfigs>, Name> extends never
      ? Extract<keyof InferStateNames<PrevConfigs>, keyof Actions> extends never
        ? false
        : true
      : true
    : false;

type HasDuplicatedNames<
  Configs,
  PrevConfigs extends Array<unknown> = [],
> = Configs extends [infer One, ...infer Rest]
  ? IsDuplicated<PrevConfigs, One> extends true
    ? true
    : HasDuplicatedNames<Rest, [...PrevConfigs, One]>
  : false;

type HasDuplicatedArgs<Configs, State> = Configs extends [
  SliceConfig<infer _Name, infer _Value, infer Actions>,
  ...infer Rest,
]
  ? {
      [actionName in keyof State]: ParametersIf<State[actionName]>;
    } extends {
      [actionName in keyof Actions]: Parameters<Actions[actionName]>;
    }
    ? HasDuplicatedArgs<Rest, State>
    : true
  : false;

type IsValidConfigs<Configs> =
  HasDuplicatedNames<Configs> extends true
    ? false
    : HasDuplicatedArgs<Configs, InferState<Configs>> extends true
      ? false
      : true;

export function createSlice<
  Name extends string,
  Value,
  Actions extends {
    [actionName: string]: (...args: never[]) => (prev: Value) => Value;
  },
>(config: SliceConfig<Name, Value, Actions>) {
  return config;
}

// FIXME no any in a reasonable way?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withSlices<Configs extends SliceConfig<string, unknown, any>[]>(
  ...configs: Configs
): IsValidConfigs<Configs> extends true
  ? (
      set: (
        fn: (prevState: InferState<Configs>) => Partial<InferState<Configs>>,
      ) => void,
    ) => InferState<Configs>
  : never {
  return ((
    set: (
      fn: (prevState: InferState<Configs>) => Partial<InferState<Configs>>,
    ) => void,
  ) => {
    const state: Record<string, unknown> = {};
    type ActionFn = (...args: unknown[]) => (prev: unknown) => unknown;
    const sliceMapsByAction = new Map<string, Map<string, ActionFn>>();
    for (const config of configs) {
      state[config.name] = config.value;
      for (const [actionName, actionFn] of Object.entries(config.actions)) {
        let actionsBySlice = sliceMapsByAction.get(actionName);
        if (!actionsBySlice) {
          sliceMapsByAction.set(actionName, (actionsBySlice = new Map()));
        }
        actionsBySlice.set(config.name, actionFn as never);
      }
    }
    for (const [actionName, actionsBySlice] of sliceMapsByAction) {
      state[actionName] = (...args: unknown[]) => {
        set(((prevState: Record<string, unknown>) => {
          const nextState: Record<string, unknown> = {};
          for (const [sliceName, actionFn] of actionsBySlice) {
            const prevSlice = prevState[sliceName];
            const nextSlice = actionFn(...args)(prevSlice);
            nextState[sliceName] = nextSlice;
          }
          return nextState;
        }) as never);
      };
    }
    return state;
  }) as never;
}
