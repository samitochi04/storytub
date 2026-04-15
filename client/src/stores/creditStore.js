import { create } from "zustand";
import { supabase } from "@/config/supabase";

const useCreditStore = create((set, get) => ({
  balance: null,
  transactions: [],
  loading: false,

  setBalance: (balance) => set({ balance }),

  fetchBalance: async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", userId)
      .single();
    if (!error && data) set({ balance: data.credits_balance });
  },

  fetchTransactions: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error) set({ transactions: data || [] });
    set({ loading: false });
  },

  refresh: async (userId) => {
    const { fetchBalance, fetchTransactions } = get();
    await Promise.all([fetchBalance(userId), fetchTransactions(userId)]);
  },
}));

export default useCreditStore;
