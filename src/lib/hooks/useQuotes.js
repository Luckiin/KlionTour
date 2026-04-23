import useSWR from "swr";
import { getAllQuotes } from "@/lib/services/quotes";

export function useQuotes() {
  const { data, error, isLoading, mutate } = useSWR("admin-quotes", getAllQuotes);

  return {
    quotes: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
