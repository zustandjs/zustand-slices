/* eslint no-restricted-syntax: off */

type SliceConfig<
  Name extends string,
  SliceValue,
  Actions extends {
    [actionName: string]: (
      ...args: never[]
    ) => (slice: SliceValue) => SliceValue;
  },
> = {
  name: Name;
  value: SliceValue;
  actions: Actions;
};

type InferState<Configs> = Configs extends [
  SliceConfig<infer Name, infer SliceValue, infer Actions>,
  ...infer Rest,
]
  ? { [name in Name]: SliceValue } & {
      [actionName in keyof Actions]: (
        ...args: Parameters<Actions[actionName]>
      ) => void;
    } & InferState<Rest>
  : unknown;

export function createSlice<
  Name extends string,
  SliceValue,
  Actions extends {
    [actionName: string]: (
      ...args: never[]
    ) => (slice: SliceValue) => SliceValue;
  },
>(config: SliceConfig<Name, SliceValue, Actions>) {
  return config;
}

export function withSlices<Configs extends SliceConfig<string, unknown, any>[]>(
  ...configs: Configs
): (
  set: (
    fn: (prevState: InferState<Configs>) => Partial<InferState<Configs>>,
  ) => void,
) => InferState<Configs> {
  return (set) => {
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
  };
}
