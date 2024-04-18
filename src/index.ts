type ParametersIf<T> = T extends (...args: infer Args) => any ? Args : never;

type SliceConfig<
  Name extends string,
  Value,
  Actions extends {
    [actionName: string]: (...args: never[]) => (slice: Value) => Value;
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

type IsDupicated<Name, Names extends unknown[]> = Names extends [
  infer One,
  ...infer Rest,
]
  ? One extends Name
    ? true
    : IsDupicated<Name, Rest>
  : false;

type HasDuplicatedNames<
  Configs,
  Names extends string[] = [],
> = Configs extends [
  SliceConfig<infer Name, infer _Value, infer Actions>,
  ...infer Rest,
]
  ? Name extends Names[number]
    ? true
    : IsDupicated<keyof Actions, Names> extends true
      ? true
      : HasDuplicatedNames<Rest, [Name, ...Names]>
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
    [actionName: string]: (...args: never[]) => (slice: Value) => Value;
  },
>(config: SliceConfig<Name, Value, Actions>) {
  return config;
}

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
    const state: any = {};
    const actionNameSet = new Set<string>();
    for (const config of configs) {
      state[config.name] = config.value;
      for (const actionName of Object.keys(config.actions)) {
        actionNameSet.add(actionName);
      }
    }
    for (const actionName of actionNameSet) {
      state[actionName] = (...args: any[]) => {
        // FIXME not very efficient to do this every time
        for (const config of configs) {
          const actionFn = config.actions[actionName];
          if (actionFn) {
            set((prevState: any) => {
              const prevSlice = prevState[config.name];
              const nextSlice = actionFn(...args)(prevSlice);
              return { [config.name]: nextSlice } as any;
            });
          }
        }
      };
    }
    return state;
  }) as never;
}
