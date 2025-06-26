"use client";

import { createContext, useRef, useContext } from "react";
import { useStore } from "zustand";
import {
  createSessionStore,
  initSessionStore,
  createLocalStore,
  initLocalStore,
} from "@/utils/store/stores";

// Session Store
export const SessionStoreContext = createContext(undefined);
export const SessionStoreProvider = ({ children }) => {
  const storeRef = useRef(null);
  if (storeRef.current === null) {
    storeRef.current = createSessionStore(initSessionStore());
  }

  return (
    <SessionStoreContext.Provider value={storeRef.current}>
      {children}
    </SessionStoreContext.Provider>
  );
};

export const useSessionStore = (selector = (state) => state) => {
  const sessionStoreContext = useContext(SessionStoreContext);

  if (!sessionStoreContext) {
    throw new Error(`useSessionStore must be used within SessionStoreProvider`);
  }

  return useStore(sessionStoreContext, selector);
};

// Local Store
export const LocalStoreContext = createContext(undefined);
export const LocalStoreProvider = ({ children }) => {
  const storeRef = useRef(null);
  if (storeRef.current === null) {
    storeRef.current = createLocalStore(initLocalStore());
  }

  return (
    <LocalStoreContext.Provider value={storeRef.current}>
      {children}
    </LocalStoreContext.Provider>
  );
};

export const useLocalStore = (selector = (state) => state) => {
  const localStoreContext = useContext(LocalStoreContext);

  if (!localStoreContext) {
    throw new Error(`useLocalStore must be used within LocalStoreProvider`);
  }

  return useStore(localStoreContext, selector);
};

// Store Provider
export const StoreProvider = ({ children }) => {
  return (
    <SessionStoreProvider>
      <LocalStoreProvider>{children}</LocalStoreProvider>
    </SessionStoreProvider>
  );
};
