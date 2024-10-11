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

type SetState<T> = (fn: (state: T) => Partial<T>) => void;
type GetState<T> = () => T;

export function withActions<
  State,
  Actions extends {
    [actionName: string]: (...args: never[]) => (state: State) => void;
  },
>(
  config: (set: SetState<State>, get: GetState<State>) => State,
  actions: IsValidActions<State, Actions>,
): (
  set: SetState<State & InferStateActions<Actions>>,
  get: GetState<State & InferStateActions<Actions>>,
) => State & InferStateActions<Actions> {
  return (set, get) => {
    const state: Record<string, unknown> = config(set as never, get) as never;
    for (const [actionName, actionFn] of Object.entries(actions)) {
      state[actionName] = (...args: unknown[]) => {
        actionFn(...(args as never[]))(get());
      };
    }
    return state as never;
  };
}
