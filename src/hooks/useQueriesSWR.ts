import useSWR from 'swr';
import httpClient from '@/lib/api/httpClient';
import type { QueryType } from '@/types/query';

const fetcher = (url: string) => httpClient.get<QueryType[]>(url).then((res) => res.data);

export function useQueriesSWR() {
  const { data, error, isLoading, mutate } = useSWR<QueryType[]>('/query-types', fetcher, {
    revalidateOnFocus: false, // Don't revalidate on window focus to save requests
    dedupingInterval: 60000, // Dedup requests within 1 minute
  });

  return {
    queries: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
