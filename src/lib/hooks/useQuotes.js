import useSWR from "swr";
import { getAllQuotes, getMyQuotes } from "@/lib/services/quotes";

export function useQuotes() {
  const { data, error, isLoading, mutate } = useSWR("admin-quotes", getAllQuotes);

  return {
    quotes: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
export function useMyQuotes(userId) {
  const { data, error, isLoading, mutate } = useSWR(userId ? `user-quotes-${userId}` : null, () => getMyQuotes(userId));

  return {
    quotes: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
