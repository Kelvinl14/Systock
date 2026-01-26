"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductDialog } from "@/components/dialogs/product-dialog"
import { Edit, Trash2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { 
  useProducts, 
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "@/lib/hooks/use-products"
import {
  useCategories
} from "@/lib/hooks/use-categories"
import { tr } from "date-fns/locale"
import { useStock } from "@/lib/hooks/use-stock"

const mockProducts = [
  {
    id: "1",
    name: "MacBook Pro M3",
    sku: "MB-PRO-M3",
    category: "Eletrônicos",
    stock: 15,
    price: 8900.0,
    active: true,
  },
  {
    id: "2",
    name: "Mouse Wireless",
    sku: "MW-001",
    category: "Periféricos",
    stock: 0,
    price: 89.9,
    active: true,
  },
  {
    id: "3",
    name: "Teclado Mecânico",
    sku: "TM-RGB",
    category: "Periféricos",
    stock: 5,
    price: 450.0,
    active: false,
  },
]

export default function ProductsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [category, setCategory] = useState("all")
  
  //const [products, setProducts] = useState(mockProducts)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  // Hooks da API
  const { data: products = [], isLoading } = useProducts()
  const { data: categories = [] } = useCategories()
  const { data: stock = [] } = useStock()
  const updateProduct = useUpdateProduct()
  const createProduct = useCreateProduct()
  const deleteProduct = useDeleteProduct()

  // Filtrar categorias a partir do ID do produto
  const sortedCategories = categories.sort((a: any, b: any) =>
  a.name.localeCompare(b.name)
  )

  // Filtrar produtos a partir da busca e categoria
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "all" || product.category_id === Number(category)
    return matchesSearch && matchesCategory
  })

  const handleAddProduct = async (data: any) => {
      try {
      await createProduct.mutateAsync({
        ...data,
        stock: Number(data.stock),
        price: Number(data.price),
        category_id: Number(data.category_id),
      })
      toast.success("Produto criado com sucesso!")
    } catch (error) {
      toast.error("Erro ao criar produto!")
    }
  }

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProduct.mutateAsync(id)
      toast.success("Produto deletado com sucesso!")
    } catch (error) {
      toast.error("Erro ao deletar produto!")
    }
  }

  const handleUpdateProduct = async (data: any) => {
    try {
      await updateProduct.mutateAsync({
        id: Number(editingProduct.id),
        ...data,
      })
      toast.success("Produto atualizado com sucesso!")
      setEditingProduct(null)
    } catch {
      toast.error("Erro ao atualizar produto.")
    }
  }

  function getProductStock(productId: number) {
  return stock
    .filter((s: any) => s.product_id === productId)
    .reduce((total: number, item: any) => total + item.quantity, 0)
}




  // const columns = [
  //   {
  //     key: "name" as const,
  //     label: "Produto",
  //     render: (value: string) => <span className="font-medium">{value}</span>,
  //   },
  //   { 
  //     key: "category_id" as const, 
  //     label: "Categoria",
  //     render: (value: number) => {
  //       const categoryName = categories.find((c: any) => c.id === value)?.name || "—"
  //       return <span>{categoryName}</span>
  //     },
  //   },
  //   {
  //     key: "stock" as const,
  //     label: "Estoque",
  //     render: (value: number) => <span className={value === 0 ? "text-red-600 font-medium" : ""}>{value} un</span>,
  //   },
  //   {
  //     key: "sale_price" as const,
  //     label: "Preço",
  //     render: (value: number) => `R$ ${value.toFixed(2)}`,
  //   },
  //   {
  //     key: "active" as const,
  //     label: "Status",
  //     render: (value: boolean) => (
  //       <span
  //         className={`px-2 py-1 rounded text-sm font-medium ${value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
  //       >
  //         {value ? "Ativo" : "Inativo"}
  //       </span>
  //     ),
  //   },
  // ]
  const columns = [
  {
    key: "name",
    label: "Produto",
    render: (value: string) => <span className="font-medium">{value}</span>,
  },
  {
    key: "category_id",
    label: "Categoria",
    render: (value: number) => {
      const categoryName = categories.find((c: any) => c.id === value)?.name || "—"
      return <span>{categoryName}</span>
    },
  },
  {
    key: "stock",
    label: "Estoque",
    render: (_: any, row: any) => {
      const quantity = getProductStock(row.id)
      return (
        <span className={quantity === 0 ? "text-red-600 font-medium" : ""}>
          {quantity} un
        </span>
      )
    },
  },
  {
    key: "sale_price",
    label: "Preço",
    render: (value: number) => `R$ ${(value ?? 0).toFixed(2)}`,
  },
  {
    key: "active",
    label: "Status",
    render: (value: boolean) =>
      value ? (
        <span className="px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-700">Ativo</span>
      ) : (
        <span className="px-2 py-1 rounded text-sm font-medium bg-gray-100 text-gray-700">Inativo</span>
      ),
  },
]


  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Produtos</h1>
              <p className="text-muted-foreground">Gerencie seu catálogo de produtos</p>
            </div>
            <ProductDialog onSubmit={handleAddProduct} />
          </div>

          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Buscar por nome"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full bg-transparent">
                Filtrar
              </Button>
            </div>
          </Card>

          <DataTable
            data={filteredProducts}
            columns={columns}
            pageSize={10}
            actions={(product: any) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                  onClick={() => setEditingProduct({ ...product })}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>Duplicar</DropdownMenuItem>
                  <DropdownMenuItem>Favoritar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteProduct(Number(product.id))} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
          {editingProduct && (
            <ProductDialog
              defaultValues={editingProduct}
              onSubmit={handleUpdateProduct}
              onClose={() => setEditingProduct(null)}
            />
          )}
        </main>
      </div>
    </div>
  )
}
