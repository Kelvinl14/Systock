import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Product } from "@/types"

export function useProducts(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ["products/all", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/products/all", { params: filters })
      return data
    },
  })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/products/${id}`)
      return data
    },
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (product: Omit<Product, "id" | "createdAt">) => {
      const { data } = await apiClient.post("/products", product)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: number }) => {
      const { data } = await apiClient.put(`/products/${id}`, product)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/products/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  })
}
