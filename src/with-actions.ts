type InferStateActions<Actions> = Actions extends {
  [actionName: string]: (...args: never[]) => unknown;
}
  ? {
      [actionName in keyof Actions]: (
        ...args: Parameters<Actions[actionName]>
      ) => void;
    }
  : unknown;

type IsValidActions<State, Actions> =
  Extract<keyof Actions, keyof State> extends never ? Actions : never;

export function withActions<
  State,
  Actions extends {
    [actionName: string]: (...args: never[]) => (state: State) => void;
  },
>(
  config: (set: (fn: (prevState: State) => Partial<State>) => void) => State,
  actions: IsValidActions<State, Actions>,
): (
  set: (
    fn: (
      prevState: State & InferStateActions<Actions>,
    ) => Partial<State & InferStateActions<Actions>>,
  ) => void,
  get: () => State & InferStateActions<Actions>,
) => State & InferStateActions<Actions> {
  return ((
    set: (
      fn: (
        prevState: State & InferStateActions<Actions>,
      ) => Partial<State & InferStateActions<Actions>>,
    ) => void,
    get: () => State & InferStateActions<Actions>,
  ) => {
    const state: Record<string, unknown> = config(set as never) as never;
    for (const [actionName, actionFn] of Object.entries(actions)) {
      state[actionName] = (...args: unknown[]) => {
        actionFn(...(args as never[]))(get());
      };
    }
    return state;
  }) as never;
}
