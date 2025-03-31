import { QueryClient } from "@tanstack/react-query";
import { FALLBACK_LOOKUPS } from "@config/lookupConfig";
import { getLookupQueryKey } from "@hooks/useLookup";
import axiosInstance from "@api/axiosInstance";

/*

   This service does two things:
    1. We define our API calls to fetch lookup data from the server.
    2. We define functions to get lookup data from the cache or fallback to the mock data.
      - We should primarily rely on the useLookup hook to get lookup data in our components.
      - We should only use these functions directly in cases where we can't use the hook.

*/

export type LookupEntry = { name: string; value: string };
export type LookupGroup = { name: string; data: LookupEntry[] };

let queryClientSingleton: QueryClient | null = null;
export const registerQueryClient = (client: QueryClient) => {
  queryClientSingleton = client;
};

const getGroup = (key: string): LookupGroup | undefined => {
  const qc = queryClientSingleton;
  return (
    qc?.getQueryData<LookupGroup>(getLookupQueryKey(key)) ??
    FALLBACK_LOOKUPS[key]
  );
};

export const getLookupByValue = (
  key: string,
  value: string
): string | undefined => {
  return getGroup(key)?.data.find((e) => e.value === value)?.name;
};

export const getLookupByName = (
  key: string,
  name: string
): string | undefined => {
  return getGroup(key)?.data.find((e) => e.name === name)?.value;
};

export const fetchLookupsByKeys = async (keys: string[]) => {
  const params = new URLSearchParams();
  keys.forEach((key) => params.append("lookups", key));

  const response = await axiosInstance.get(`/lookupData?${params.toString()}`);
  return response.data as Record<
    string,
    {
      name: string;
      data: { name: string; value: string }[];
    }
  >;
};
