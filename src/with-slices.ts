type SliceActions<Value> = {
  [actionName: string]: (...args: never[]) => (prev: Value) => Value | void;
};

type SliceConfig<
  Name extends string,
  Value,
  Actions extends SliceActions<Value>,
> = {
  name: Name;
  value: Value;
  actions: Actions;
};

type ParametersIf<T> = T extends (...args: infer Args) => unknown
  ? Args
  : never;

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

type HasDuplicatedNames<
  Configs,
  Names extends string[] = [],
> = Configs extends [
  SliceConfig<infer Name, infer _Value, infer Actions>,
  ...infer Rest,
]
  ? Extract<Name | keyof Actions, Names[number]> extends never
    ? HasDuplicatedNames<Rest, [Name, ...Names]>
    : true
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

type ValidConfigs<Configs> =
  HasDuplicatedNames<Configs> extends true
    ? never
    : HasDuplicatedArgs<Configs, InferState<Configs>> extends true
      ? never
      : Configs;

export function withSlices<
  Configs extends SliceConfig<string, unknown, NonNullable<unknown>>[],
>(
  ...configs: ValidConfigs<Configs>
): (
  set: (
    fn: (prevState: InferState<Configs>) => Partial<InferState<Configs>>,
  ) => void,
) => InferState<Configs> {
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
