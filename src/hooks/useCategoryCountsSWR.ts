import useSWR from 'swr';
import httpClient from '@/lib/api/httpClient';
import type { QueryCategory } from '@/types/query';

const fetcher = (url: string) => httpClient.get<Record<QueryCategory, number>>(url).then((res) => res.data);

export function useCategoryCountsSWR() {
  const { data, error, isLoading } = useSWR<Record<QueryCategory, number>>(
    '/query-types/counts-by-category',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    counts: data || ({} as Record<QueryCategory, number>),
    isLoading,
    isError: error,
  };
}
