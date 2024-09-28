import type { SliceConfig } from './create-slice.js';

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

type HasDuplicatedNames<Configs, Names = never> = Configs extends [
  SliceConfig<infer Name, infer _Value, infer Actions>,
  ...infer Rest,
]
  ? Extract<Name | keyof Actions, Names> extends never
    ? HasDuplicatedNames<Rest, Name | keyof Actions | Names>
    : true
  : false;

type ValidConfigs<Configs> =
  HasDuplicatedNames<Configs> extends true ? never : Configs;

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
    for (const config of configs) {
      state[config.name] = config.value;
      for (const [actionName, actionFn] of Object.entries<ActionFn>(
        config.actions,
      )) {
        state[actionName] = (...args: unknown[]) => {
          set(((prevState: Record<string, unknown>) => ({
            [config.name]: actionFn(...args)(prevState[config.name]),
          })) as never);
        };
      }
    }
    return state;
  }) as never;
}
