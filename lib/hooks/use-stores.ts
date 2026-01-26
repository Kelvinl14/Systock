import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Store } from "@/types"

export function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data } = await apiClient.get("/stores")
      return data
    },
  })
}

export function useCreateStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (store: Omit<Store, "id">) => {
      const { data } = await apiClient.post("/stores", store)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stores"] }),
  })
}

export function useUpdateStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...store }: Partial<Store> & { id: string }) => {
      const { data } = await apiClient.put(`/stores/${id}`, store)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stores"] }),
  })
}

export function useDeleteStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/stores/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stores"] }),
  })
}
