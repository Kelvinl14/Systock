import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Category } from "@/types"

export function useCategories(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ["categories", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/categories", { params: filters })
      return data
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (category: Omit<Category, "id">) => {
      const { data } = await apiClient.post("/categories", category)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...category }: Partial<Category> & { id: number }) => {
      const { data } = await apiClient.put(`/categories/${id}`, category)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/categories/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  })
}
