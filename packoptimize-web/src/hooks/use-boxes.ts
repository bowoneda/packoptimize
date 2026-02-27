"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { BoxType } from "@/types/api";

export function useBoxes() {
  return useQuery({
    queryKey: ["boxes"],
    queryFn: async () => {
      const res = await api.get<BoxType[]>("/box-types");
      return res.data;
    },
  });
}

export function useCreateBox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<BoxType>) => {
      const res = await api.post<BoxType>("/box-types", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boxes"] });
    },
  });
}

export function useUpdateBox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BoxType> & { id: string }) => {
      const res = await api.put<BoxType>(`/box-types/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boxes"] });
    },
  });
}

export function useDeleteBox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/box-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boxes"] });
    },
  });
}
