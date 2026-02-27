"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { CarrierConstraint } from "@/types/api";

export function useCarrierRules() {
  return useQuery({
    queryKey: ["carrier-rules"],
    queryFn: async () => {
      const res = await api.get<CarrierConstraint[]>("/carrier-rules");
      return res.data;
    },
  });
}
