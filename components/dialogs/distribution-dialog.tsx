"use client"

import type React from "react"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { useStores } from "@/lib/hooks/use-stores"
import { useProducts } from "@/lib/hooks/use-products"
import { useStock } from "@/lib/hooks/use-stock"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

const CENTRAL_STORE_ID = 1

interface DistributionItem {
  product_id: number
  product_name: string
  quantity: number
  available_stock: number
}

const distributionSchema = z.object({
  to_store_id: z.coerce.number().min(1, "Selecione a loja de destino"),
  distribution_date: z.string().min(1, "Data é obrigatória"),
})

type DistributionFormData = z.infer<typeof distributionSchema>

interface DistributionDialogProps {
  onSuccess?: () => void
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  trigger?: React.ReactNode | null
}

export function DistributionDialog({ onSuccess, onSubmit, isLoading = false, trigger }: DistributionDialogProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<DistributionItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<DistributionFormData>({
    resolver: zodResolver(distributionSchema),
    defaultValues: {
      distribution_date: new Date().toISOString().split("T")[0],
    },
  })

  const { data: stores = [] } = useStores()
  const { data: products = [] } = useProducts()
  const { data: stockData = [] } = useStock()

  const centralStore = stores.find((s: any) => s.id === CENTRAL_STORE_ID)
  const destinationStores = stores.filter((s: any) => s.id !== CENTRAL_STORE_ID)

  const getStockForProduct = (productId: number): number => {
    const stockItem = stockData.find(
      (s: any) => s.product_id === productId && s.store_id === CENTRAL_STORE_ID
    )
    return stockItem?.quantity || 0
  }

  const getAvailableStock = (productId: number): number => {
    const totalStock = getStockForProduct(productId)
    const reservedInItems = items
      .filter((item) => item.product_id === productId)
      .reduce((sum, item) => sum + item.quantity, 0)
    return totalStock - reservedInItems
  }

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error("Selecione um produto")
      return
    }

    const productId = Number(selectedProduct)
    const product = products.find((p: any) => p.id === productId)
    
    if (!product) {
      toast.error("Produto não encontrado")
      return
    }

    const availableStock = getAvailableStock(productId)

    if (quantity <= 0) {
      toast.error("Quantidade deve ser maior que zero")
      return
    }

    if (quantity > availableStock) {
      toast.error(`Estoque insuficiente. Disponível: ${availableStock}`)
      return
    }

    const existingItemIndex = items.findIndex((item) => item.product_id === productId)

    if (existingItemIndex >= 0) {
      const updatedItems = [...items]
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity
      
      if (newQuantity > getStockForProduct(productId)) {
        toast.error(`Estoque insuficiente. Disponível: ${availableStock}`)
        return
      }
      
      updatedItems[existingItemIndex].quantity = newQuantity
      setItems(updatedItems)
    } else {
      setItems([
        ...items,
        {
          product_id: productId,
          product_name: product.name,
          quantity: quantity,
          available_stock: availableStock,
        },
      ])
    }

    setSelectedProduct("")
    setQuantity(1)
  }

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter((item) => item.product_id !== productId))
  }

  const handleFormSubmit = async (data: DistributionFormData) => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item")
      return
    }

    try {
      const payload = {
        from_store_id: CENTRAL_STORE_ID,
        to_store_id: data.to_store_id,
        distribution_date: new Date(data.distribution_date).toISOString(),
        status: "pending",
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          registered_at: new Date().toISOString(),
        })),
      }

      await onSubmit(payload)
      reset()
      setItems([])
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao salvar distribuição:", error)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      reset()
      setItems([])
      setSelectedProduct("")
      setQuantity(1)
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Distribuição
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Distribuição</DialogTitle>
          <DialogDescription>Distribua produtos do estoque central para outras lojas</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loja de Origem</Label>
              <Input 
                value={centralStore?.name || "Estoque Central"} 
                disabled 
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>Loja de Destino</Label>
              <Controller
                name="to_store_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a loja de destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinationStores?.map((store: any) => (
                        <SelectItem key={store.id} value={String(store.id)}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.to_store_id && <p className="text-sm text-destructive">{errors.to_store_id.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data da Distribuição</Label>
            <Input type="date" {...register("distribution_date")} />
            {errors.distribution_date && <p className="text-sm text-destructive">{errors.distribution_date.message}</p>}
          </div>

          <Card className="p-4">
            <Label className="text-base font-semibold mb-4 block">Adicionar Produto</Label>
            <div className="grid grid-cols-6 gap-3 items-end">
              <div className="col-span-6 space-y-2">
                <Label>Produto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product: any) => {
                      const available = getAvailableStock(product.id)
                      return (
                        <SelectItem 
                          key={product.id} 
                          value={String(product.id)}
                          disabled={available <= 0}
                        >
                          {product.name} (Disp: {available})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3 space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <div className="col-span-3">
                <Button type="button" onClick={handleAddItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Itens da Distribuição</Label>
              <span className="text-sm text-muted-foreground">
                {items.length} produto(s) - {totalItems} unidade(s)
              </span>
            </div>

            {items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium truncate max-w-0">{item.product_name}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleRemoveItem(item.product_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                Nenhum item adicionado. Selecione produtos acima.
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || items.length === 0}>
              {isLoading ? "Processando..." : "Confirmar Distribuição"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
