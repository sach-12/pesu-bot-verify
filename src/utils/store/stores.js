import { createStore } from "zustand";
import { persist } from "zustand/middleware";

const defaultInitState = {
  user: null,
  authSessionState: null,
};

export const createPersistentStore = (initState = defaultInitState) => {
  return createStore(
    persist(
      (set) => ({
        ...initState,
        setAuthSessionState: (authSessionState) => set({ authSessionState }),
        deleteAuthSessionState: () => set({ authSessionState: null }),
        setUser: (user) => set({ user }),
        deleteUser: () => set({ user: null }),
        _hasHydrated: false,
        setHasHydrated: (state) => set({ _hasHydrated: state }),
      }),
      {
        name: "pd_store",
        getStorage: () => {
          // Check if we're in the browser environment
          if (typeof window !== "undefined") {
            return localStorage;
          }
          // Return a no-op storage for SSR
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        },
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    )
  );
};
