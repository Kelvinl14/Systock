"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStock } from "@/lib/hooks/use-stock"
import { useStores } from "@/lib/hooks/use-stores"
import { useProducts } from "@/lib/hooks/use-products"
import { useCategories } from "@/lib/hooks/use-categories"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Package, AlertCircle } from "lucide-react"

export default function StockByStorePage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const { data: stock = [], isLoading: stockLoading } = useStock()
  const { data: stores = [], isLoading: storesLoading } = useStores()
  const { data: products = [] } = useProducts()
  const { data: categories = [] } = useCategories()

  const getProductName = (productId: number) => {
    const product = products.find((p: any) => p.id === productId)
    return product?.name || `Produto ${productId}`
  }

  const getProductCategoryId = (productId: number) => {
    const product = products.find((p: any) => p.id === productId)
    return product?.category_id
  }

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c: any) => c.id === categoryId)
    return category?.name || "—"
  }

  const getStockByStore = (storeId: number) => {
    return stock.filter((s: any) => s.store_id === storeId)
  }

  const getTotalQuantityByStore = (storeId: number) => {
    return getStockByStore(storeId).reduce((sum: number, s: any) => sum + s.quantity, 0)
  }

  const isLoading = stockLoading || storesLoading

  // // UseMemo para otimizar os dados da tabela
  // const tableData = useMemo(() => {
  //   if (!stores.length || !stock.length) return []

  //   // Você precisa definir qual loja está visualizando
  //   // Aqui estou usando a primeira loja como exemplo
  //   const selectedStoreId = stores[0]?.id
  //   if (!selectedStoreId) return []

  //   const storeStock = getStockByStore(selectedStoreId)
    
  //   return storeStock.map((item: any) => ({
  //     id: item.id.toString(),
  //     product_id: item.product_id,
  //     product_name: getProductName(item.product_id),
  //     category_name: getCategoryName(getProductCategoryId(item.product_id)),
  //     quantity: item.quantity,
  //     updated_at: item.updated_at,
  //     is_low_stock: item.quantity <= 15,
  //     is_out_of_stock: item.quantity === 0,
  //   }))
  // }, [stock, stores, products, categories])

  const getTableDataByStore = (storeId: number) => {
    const storeStock = getStockByStore(storeId)

    return storeStock.map((item: any) => ({
      id: item.id.toString(),
      product_id: item.product_id,
      product_name: getProductName(item.product_id),
      category_name: getCategoryName(
        getProductCategoryId(item.product_id)
      ),
      quantity: item.quantity,
      updated_at: item.updated_at,
      is_low_stock: item.quantity <= 15,
      is_out_of_stock: item.quantity === 0,
    }))
  }


  // const tableData = storeStock.map((item: any) => ({
  //   id: item.id.toString(), // DataTable espera id como string
  //   product_id: item.product_id,
  //   product_name: getProductName(item.product_id),
  //   category_name: getCategoryName(getProductCategoryId(item.product_id)),
  //   quantity: item.quantity,
  //   updated_at: item.updated_at,
  //   // Adicionar campos calculados se necessário
  //   is_low_stock: item.quantity <= 5,
  //   is_out_of_stock: item.quantity === 0,
  // }))

  // Definir as colunas
  const columns = useMemo(() => [
    {
      key: "product_name",
      label: "Produto",
      render: (value: any, row: any) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: "category_name",
      label: "Categoria",
      render: (value: any) => value || "—",
    },
    {
      key: "quantity",
      label: "Quantidade",
      render: (value: number, row: any) => (
        <div className="flex items-center justify-center gap-2">
          {row.is_low_stock && !row.is_out_of_stock && (
            <AlertCircle className="w-4 h-4 text-yellow-600" />
          )}
          <span
            className={
              row.is_out_of_stock
                ? "text-red-600 font-bold"
                : row.is_low_stock
                ? "text-yellow-600 font-medium"
                : ""
            }
          >
            {value} un
          </span>
        </div>
      ),
    },
    {
      key: "updated_at",
      label: "Última Atualização",
      render: (value: string) =>
        value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "—",
    },
  ], [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Estoque por Loja</h1>
              <p className="text-muted-foreground">Visualize o estoque real em cada loja</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : stores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma loja cadastrada</div>
          ) : (
            <div className="space-y-6">
              {stores.map((store: any) => {
                const storeStock = getStockByStore(store.id)
                const totalQuantity = getTotalQuantityByStore(store.id)
                const tableData = getTableDataByStore(store.id)

                return (
                  <Card key={store.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          {store.name}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{storeStock.length} produto(s)</span>
                          <span className="font-medium text-foreground">{totalQuantity} unidades</span>
                        </div>
                      </div>
                      {store.address && (
                        <p className="text-sm text-muted-foreground">{store.address}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {storeStock.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                          Nenhum produto em estoque nesta loja
                        </div>
                      ) : (
                         <DataTable
                            data={tableData}
                            columns={columns}
                            pageSize={10} 
                          />
                        // <Table>
                        //   <TableHeader>
                        //     <TableRow>
                        //       <TableHead>Produto</TableHead>
                        //       <TableHead>Categoria</TableHead>
                        //       <TableHead className="text-center">Quantidade</TableHead>
                        //       <TableHead className="text-right">Última Atualização</TableHead>
                        //     </TableRow>
                        //   </TableHeader>
                        //   <TableBody>
                        //     {storeStock.map((item: any) => {
                        //       const categoryId = getProductCategoryId(item.product_id)
                        //       const isLowStock = item.quantity <= 5
                        //       const isOutOfStock = item.quantity === 0

                        //       return (
                        //         <TableRow key={item.id}>
                        //           <TableCell className="font-medium">
                        //             {getProductName(item.product_id)}
                        //           </TableCell>
                        //           <TableCell>
                        //             {categoryId ? getCategoryName(categoryId) : "—"}
                        //           </TableCell>
                        //           <TableCell className="text-center">
                        //             <div className="flex items-center justify-center gap-2">
                        //               {isLowStock && !isOutOfStock && (
                        //                 <AlertCircle className="w-4 h-4 text-yellow-600" />
                        //               )}
                        //               <span
                        //                 className={
                        //                   isOutOfStock
                        //                     ? "text-red-600 font-bold"
                        //                     : isLowStock
                        //                     ? "text-yellow-600 font-medium"
                        //                     : ""
                        //                 }
                        //               >
                        //                 {item.quantity} un
                        //               </span>
                        //             </div>
                        //           </TableCell>
                        //           <TableCell className="text-right text-muted-foreground">
                        //             {item.updated_at
                        //               ? format(new Date(item.updated_at), "dd/MM/yyyy HH:mm")
                        //               : "—"}
                        //           </TableCell>
                        //         </TableRow>
                        //       )
                        //     })}
                        //   </TableBody>
                        // </Table>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
