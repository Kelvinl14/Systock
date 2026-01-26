import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Entry } from "@/types"

export function useEntries(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ["entries/all", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/entries/all", { params: filters })
      return data
    },
  })
}

export function useCreateEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (entry: Omit<Entry, "id">) => {
      const { data } = await apiClient.post("/entries", entry)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] })
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] })
      queryClient.invalidateQueries({ queryKey: ["stock-store"] })
    },
  })
}
