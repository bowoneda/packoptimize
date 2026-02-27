"use client";

import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { OptimizeRequest, OptimizeResponse } from "@/types/api";

export function useOptimize() {
  return useMutation({
    mutationFn: async (data: OptimizeRequest) => {
      const res = await api.post<OptimizeResponse>("/v1/optimize", data);
      return res.data;
    },
  });
}
