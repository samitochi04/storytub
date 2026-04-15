import { useEffect } from "react";
import useAuthStore from "@/stores/authStore";
import useCreditStore from "@/stores/creditStore";

export default function useCredits() {
  const user = useAuthStore((s) => s.user);
  const {
    balance,
    transactions,
    loading,
    fetchBalance,
    fetchTransactions,
    refresh,
  } = useCreditStore();

  useEffect(() => {
    if (user?.id && balance === null) {
      fetchBalance(user.id);
    }
  }, [user?.id, balance, fetchBalance]);

  return {
    balance,
    transactions,
    loading,
    fetchTransactions: () => fetchTransactions(user?.id),
    refresh: () => refresh(user?.id),
  };
}
