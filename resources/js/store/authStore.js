import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            _hasHydrated: false,

            setAuth: (user, token) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                }),

            updateUser: (user) => set({ user }),

            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                // Called when rehydration is done
                state?.setHasHydrated(true);
            },
        }
    )
);
