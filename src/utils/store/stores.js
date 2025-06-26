import { createStore } from "zustand";
import { persist } from "zustand/middleware";

export const initSessionStore = () => {
  return { user: null, token: null };
};

export const defaultInitSessionState = {
  user: null,
  token: null,
};

export const createSessionStore = (initState = defaultInitSessionState) => {
  return createStore()((set) => ({
    ...initState,
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    deleteSession: () => set({ user: null, token: null }),
  }));
};

export const initLocalStore = () => {
  return { session: null };
};

export const defaultInitLocalState = {
  session: null,
};

export const createLocalStore = (initState = defaultInitLocalState) => {
  return createStore(
    persist(
      (set) => ({
        ...initState,
        setSession: (session) => set({ session }),
        deleteSession: () => set({ session: null }),
      }),
      {
        name: "local_store_session",
      }
    )
  );
};
