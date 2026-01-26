import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export interface MovementFilters {
  skip?: number
  limit?: number
  product_id?: number
  store_id?: number
  movement_type?: string
  reference_type?: string
}

export function useMovements(filters?: MovementFilters) {
  return useQuery({
    queryKey: ["movements", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/movements", { params: filters })
      return data
    },
  })
}
