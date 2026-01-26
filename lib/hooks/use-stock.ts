import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { StockMovement } from "@/types"

export function useStockMovements(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ["stock-movements", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/stock-movements", { params: filters })
      return data
    },
  })
}

export function useStock() {
  return useQuery({
    queryKey: ["stock/all"],
    queryFn: async () => {
      const { data } = await apiClient.get("/stock/all")
      return data
    },
  })
}

export function useStockByStore(storeId?: string) {
  return useQuery({
    queryKey: ["stock/all", storeId],
    queryFn: async () => {
      const { data } = await apiClient.get("/stock/all", { params: { storeId } })
      return data
    },
  })
}

export function useCreateMovement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (movement: Omit<StockMovement, "id">) => {
      const { data } = await apiClient.post("/stock-movements", movement)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] })
      queryClient.invalidateQueries({ queryKey: ["stock-store"] })
    },
  })
}
