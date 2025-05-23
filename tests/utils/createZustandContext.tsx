import { createContext, useContext, useRef } from 'react';
import type { ReactNode } from 'react';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand';

type ExtractState<S> = S extends {
  getState: () => infer State;
}
  ? State
  : never;

function createZustandContext<Store extends StoreApi<unknown>>(
  initializeStore: () => Store,
) {
  const Context = createContext<Store | undefined>(undefined);
  const StoreProvider = ({ children }: { children: ReactNode }) => {
    const storeRef = useRef<Store>(undefined);
    if (!storeRef.current) {
      storeRef.current = initializeStore();
    }
    return (
      <Context.Provider value={storeRef.current}>{children}</Context.Provider>
    );
  };
  function useStoreApi() {
    const store = useContext(Context);
    if (!store) {
      throw new Error('useStoreApi must be used within a StoreProvider');
    }
    return store;
  }
  function useSelector<Selected>(
    selector: (state: ExtractState<Store>) => Selected,
  ) {
    const store = useStoreApi();
    return useStore(store, selector);
  }
  return { StoreProvider, useStoreApi, useSelector };
}

export default createZustandContext;
