type InferStateActions<Actions> = Actions extends {
  [actionName: string]: (...args: never[]) => unknown;
}
  ? {
      [actionName in keyof Actions]: (
        ...args: Parameters<Actions[actionName]>
      ) => void;
    }
  : unknown;

// FIXME we should check name collisions between state and actions (help wanted)
type IsValidActions<_State, _Actions> = true;

export function withActions<
  State,
  Actions extends {
    [actionName: string]: (...args: never[]) => (state: State) => void;
  },
>(
  config: (set: (fn: (prevState: State) => Partial<State>) => void) => State,
  actions: Actions,
): (
  set: (
    fn: (
      prevState: State & InferStateActions<Actions>,
    ) => Partial<State & InferStateActions<Actions>>,
  ) => void,
  get: () => State & InferStateActions<Actions>,
) => IsValidActions<State, Actions> extends true
  ? State & InferStateActions<Actions>
  : never {
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
