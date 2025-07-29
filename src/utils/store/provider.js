"use client";

import { createContext, useRef, useContext } from "react";
import { useStore } from "zustand";
import {
  createPersistentStore,
} from "@/utils/store/stores";

export const StoreContext = createContext(undefined);
export const StoreProvider = ({ children }) => {
  const storeRef = useRef(null);
  if (storeRef.current === null) {
    storeRef.current = createPersistentStore();
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

export const usePersistentStore = (selector = (state) => state) => {
  const persistentStoreContext = useContext(StoreContext);

  if (!persistentStoreContext) {
    throw new Error(`usePersistentStore must be used within StoreProvider`);
  }

  return useStore(persistentStoreContext, selector);
};
