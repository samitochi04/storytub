import { create } from "zustand";

const useAuthStore = create((set) => ({
  // Session & user
  user: null,
  session: null,
  profile: null,
  loading: true,

  // Actions
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    }),

  setProfile: (profile) => set({ profile }),

  setLoading: (loading) => set({ loading }),

  clear: () =>
    set({
      user: null,
      session: null,
      profile: null,
      loading: false,
    }),
}));

export default useAuthStore;
