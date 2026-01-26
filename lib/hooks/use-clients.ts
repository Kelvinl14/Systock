import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Client } from "@/types"

export function useClients(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ["clients/all", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/clients/all", { params: filters })
      return data
    },
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (client: Omit<Client, "id">) => {
      const { data } = await apiClient.post("/clients", client)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...client }: Partial<Client> & { id: number }) => {
      const { data } = await apiClient.put(`/clients/${id}`, client)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/clients/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  })
}
