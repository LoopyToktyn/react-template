import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LookupGroup, fetchLookupsByKeys } from "@api/lookupService";
import { FALLBACK_LOOKUPS } from "@config/lookupConfig";

export const getLookupQueryKey = (key: string) => ["lookup", key];

const useLookupData = (key: string): LookupGroup | undefined => {
  const queryClient = useQueryClient();
  const queryKey = getLookupQueryKey(key);

  useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchLookupsByKeys([key]);
      return result[key];
    },
    staleTime: Infinity,
    retry: 2,
  });

  return (
    queryClient.getQueryData<LookupGroup>(queryKey) ?? FALLBACK_LOOKUPS[key]
  );
};

export const useLookupLabel = (key: string, value: string): string => {
  const group = useLookupData(key);
  return group?.data.find((e) => e.value === value)?.name ?? "Loading...";
};

export const useLookupValue = (key: string, name: string): string => {
  const group = useLookupData(key);
  return group?.data.find((e) => e.name === name)?.value ?? "Loading...";
};
