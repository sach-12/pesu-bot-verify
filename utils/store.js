import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

const useStore = create(
	devtools((set) => ({
		user: null,
		setUser: (user) => set({ user }),
		token: null,
		setToken: (token) => set({ token }),
	}))
);

const usePersistentStore = create(
	persist(
		devtools((set) => ({
			session: null,
			setSession: (session) => set({ session }),
		})),
		{
			name: "pd_dashboard_session",
		}
	)
);

export { useStore, usePersistentStore };
