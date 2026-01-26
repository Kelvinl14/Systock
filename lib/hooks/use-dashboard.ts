import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiDashboard from "../api-dashboard"
import type { EstoqueValor } from "@/types"

export function useEstoqueValor() {
  return useQuery({
    queryKey: ["estoque/valor"],
    queryFn: async () => {
      const { data } = await apiDashboard.get("/estoque/valor-atual")
      return data
    },
  })
}

export function useValorTotalEstoque() {
  return useQuery({
    queryKey: ['estoque', 'valor-total'],
    queryFn: async () => {
      const { data } = await apiDashboard.get("/estoque/valor-atual")
      return data
    },
    // Configurações opcionais:
    refetchInterval: 60000, // Recarrega a cada 60 segundos
    staleTime: 30000, // Dados ficam "frescos" por 30 segundos
  })
}

export function useLojaPerformance() {
  return useQuery({
    queryKey: ["lojas/performance"],
    queryFn: async () => {
      const { data } = await apiDashboard.get("/lojas/performance")
      return data
    },
  })
}

export function useVendasEvolucao() {
  return useQuery({
    queryKey: ["vendas/evolucao"],
    queryFn: async () => {
      const { data } = await apiDashboard.get("/vendas/evolucao")
      return data
    },
  })
}

// /vendas/semanais
export function useVendasSemanais() {
  return useQuery({
    queryKey: ["vendas/semanais"],
    queryFn: async () => {
      const { data } = await apiDashboard.get("/vendas/semanais")
      return data
    },
  })
}

// /categorias/top
export function useTopCategorias() {
  return useQuery({
    queryKey: ["categorias/top"],
    queryFn: async () => {
      const { data } = await apiDashboard.get("/categorias/top")
      return data
    },
  })
}

// /produtos/top
export function useTopProdutos() {
  return useQuery({
    queryKey: ["produtos/top"],
    queryFn: async () => {
      const { data } = await apiDashboard.get("/produtos/top")
      return data
    },
  }) 
}