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
import { useClients } from "@/lib/hooks/use-clients"
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

interface SaleItem {
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

const saleSchema = z.object({
  client_id: z.coerce.number().min(1, "Selecione o cliente"),
  store_id: z.coerce.number().min(1, "Selecione a loja"),
  sale_date: z.string().min(1, "Data é obrigatória"),
  delivery_type: z.string().min(1, "Tipo de entrega é obrigatório"),
  tracking_code: z.string().optional(),
  predicted_delivery: z.string().optional(),
})

type SaleFormData = z.infer<typeof saleSchema>

interface SaleDialogProps {
  onSuccess?: () => void
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  trigger?: React.ReactNode | null
}

export function SaleDialog({ onSuccess, onSubmit, isLoading = false, trigger }: SaleDialogProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<SaleItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      sale_date: new Date().toISOString().split("T")[0],
      delivery_type: "pickup",
    },
  })

  const { data: stores = [] } = useStores()
  const { data: products = [] } = useProducts()
  const { data: clients = [] } = useClients()
  const { data: stockData = [] } = useStock()

  const watchStoreId = watch("store_id")

  const getStockForProduct = (productId: number, storeId: number): number => {
    const stockItem = stockData.find(
      (s: any) => s.product_id === productId && s.store_id === storeId
    )
    return stockItem?.quantity || 0
  }

  const getAvailableStock = (productId: number): number => {
    if (!watchStoreId) return 0
    const totalStock = getStockForProduct(productId, Number(watchStoreId))
    const reservedInItems = items
      .filter((item) => item.product_id === productId)
      .reduce((sum, item) => sum + item.quantity, 0)
    return totalStock - reservedInItems
  }

  const handleAddItem = () => {
    if (!watchStoreId) {
      toast.error("Selecione a loja primeiro")
      return
    }

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
      
      if (newQuantity > getStockForProduct(productId, Number(watchStoreId))) {
        toast.error(`Estoque insuficiente. Disponível: ${availableStock}`)
        return
      }
      
      updatedItems[existingItemIndex].quantity = newQuantity
      updatedItems[existingItemIndex].total_price = newQuantity * product.sale_price
      setItems(updatedItems)
    } else {
      setItems([
        ...items,
        {
          product_id: productId,
          product_name: product.name,
          quantity: quantity,
          unit_price: product.sale_price,
          total_price: quantity * product.sale_price,
        },
      ])
    }

    setSelectedProduct("")
    setQuantity(1)
  }

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter((item) => item.product_id !== productId))
  }

  const totalValue = items.reduce((sum, item) => sum + item.total_price, 0)

  const handleFormSubmit = async (data: SaleFormData) => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item")
      return
    }

    try {
      const payload = {
        client_id: data.client_id,
        store_id: data.store_id,
        sale_date: new Date(data.sale_date).toISOString(),
        delivery_type: data.delivery_type,
        tracking_code: data.tracking_code || null,
        status: "pending",
        predicted_delivery: data.predicted_delivery ? new Date(data.predicted_delivery).toISOString() : null,
        delivered_at: null,
        total_value: totalValue,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          removed_at: null,
        })),
      }

      await onSubmit(payload)
      reset()
      setItems([])
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Erro ao salvar venda:", error)
      if (error?.response?.data?.detail) {
        toast.error(error.response.data.detail)
      }
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Venda
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Venda</DialogTitle>
          <DialogDescription>Registre uma nova venda com validação automática de estoque</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Controller
                name="client_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client: any) => (
                        <SelectItem key={client.id} value={String(client.id)}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.client_id && <p className="text-sm text-destructive">{errors.client_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Loja</Label>
              <Controller
                name="store_id"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value)
                      setItems([])
                    }} 
                    value={field.value?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a loja" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores?.map((store: any) => (
                        <SelectItem key={store.id} value={String(store.id)}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.store_id && <p className="text-sm text-destructive">{errors.store_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data da Venda</Label>
              <Input type="date" {...register("sale_date")} />
              {errors.sale_date && <p className="text-sm text-destructive">{errors.sale_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Entrega</Label>
              <Controller
                name="delivery_type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">Retirada</SelectItem>
                      <SelectItem value="delivery">Entrega</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.delivery_type && <p className="text-sm text-destructive">{errors.delivery_type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Previsão de Entrega</Label>
              <Input type="date" {...register("predicted_delivery")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Código de Rastreio (opcional)</Label>
            <Input placeholder="Ex: BR123456789" {...register("tracking_code")} />
          </div>

          <Card className="p-4">
            <Label className="text-base font-semibold mb-4 block">Adicionar Produto</Label>
            {!watchStoreId && (
              <p className="text-sm text-muted-foreground mb-4">Selecione a loja para ver os produtos disponíveis</p>
            )}
            <div className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-12 space-y-2">
                <Label>Produto</Label>
                <Select 
                  value={selectedProduct} 
                  onValueChange={setSelectedProduct}
                  disabled={!watchStoreId}
                >
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
                          {product.name} - R$ {product.sale_price?.toFixed(2)} (Disp: {available})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-4 space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={!watchStoreId}
                />
              </div>

              <div className="col-span-4 space-y-2">
                <Label>Subtotal</Label>
                <Input
                  value={`R$ ${(quantity * (products.find((p: any) => p.id === Number(selectedProduct))?.sale_price || 0)).toFixed(2)}`}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="col-span-4">
                <Button 
                  type="button" 
                  onClick={handleAddItem} 
                  className="w-full"
                  disabled={!watchStoreId}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Itens da Venda</Label>
              <span className="text-lg font-bold">
                Total: R$ {totalValue.toFixed(2)}
              </span>
            </div>

            {items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium truncate max-w-0">{item.product_name}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">R$ {item.unit_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">R$ {item.total_price.toFixed(2)}</TableCell>
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
              {isLoading ? "Processando..." : "Finalizar Venda"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
