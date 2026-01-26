import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { InternalDistribution } from "@/types"

export function useDistributions() {
  return useQuery({
    queryKey: ["distributions/all"],
    queryFn: async () => {
      const { data } = await apiClient.get("/internal-distributions/all")
      return data
    },
  })
}

export function useCreateDistribution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (distribution: Omit<InternalDistribution, "id">) => {
      const { data } = await apiClient.post("/internal-distributions", distribution)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] })
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] })
      queryClient.invalidateQueries({ queryKey: ["stock-store"] })
    },
  })
}

export function useUpdateDistribution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...distribution }: Partial<InternalDistribution> & { id: string }) => {
      const { data } = await apiClient.put(`/internal-distributions/${id}`, distribution)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["distributions"] }),
  })
}
