import { LookupGroup } from "@root/api/lookupService";

export const FALLBACK_LOOKUPS: Record<string, LookupGroup> = {
  frequency: {
    name: "frequency",
    data: [
      { name: "Annually", value: "1" },
      { name: "Monthly", value: "2" },
      { name: "Quarterly", value: "4" },
    ],
  },
  status: {
    name: "status",
    data: [
      { name: "Active", value: "A" },
      { name: "Inactive", value: "I" },
    ],
  },
};
