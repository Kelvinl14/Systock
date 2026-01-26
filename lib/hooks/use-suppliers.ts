import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Supplier } from "@/types"

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data } = await apiClient.get("/suppliers")
      return data
    },
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, "id">) => {
      const { data } = await apiClient.post("/suppliers", supplier)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...supplier }: Partial<Supplier> & { id: string }) => {
      const { data } = await apiClient.put(`/suppliers/${id}`, supplier)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/suppliers/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  })
}
