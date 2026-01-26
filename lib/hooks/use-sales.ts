import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Sale } from "@/types"

export function useSales(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ["sales/all", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/sales/all", { params: filters })
      return data
    },
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sale: Omit<Sale, "id">) => {
      const { data } = await apiClient.post("/sales", sale)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] })
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] })
    },
  })
}

export function useUpdateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...sale }: Partial<Sale> & { id: string }) => {
      const { data } = await apiClient.put(`/sales/${id}`, sale)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sales"] }),
  })
}

export function useDeleteSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/sales/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sales"] }),
  })
}
