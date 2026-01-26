"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
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
import { useSuppliers } from "@/lib/hooks/use-suppliers"
import { useProducts, useUpdateProduct } from "@/lib/hooks/use-products"
import { Card } from "@/components/ui/card"

const entryItemSchema = z.object({
  product_id: z.coerce.number().min(1, "Produto é obrigatório"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  unit_price: z.coerce.number().min(0, "Preço unitário inválido"),
  total_price: z.coerce.number().min(0),
  lot_number: z.string().optional(),
  expiration_date: z.string().optional(),
  received_at: z.string().optional(),
})

const entrySchema = z.object({
  supplier_id: z.coerce.number().min(1, "Fornecedor é obrigatório"),
  entry_date: z.string().min(1, "Data é obrigatória"),
  invoice_number: z.string().min(1, "Número da nota é obrigatório"),
  total_value: z.coerce.number().min(0),
  status: z.string().default("pending"),
  items: z.array(entryItemSchema).min(1, "Adicione pelo menos um item"),
})

type EntryFormData = z.infer<typeof entrySchema>

interface EntryDialogProps {
  onSuccess?: () => void
  onSubmit: (data: EntryFormData) => Promise<void>
  isLoading?: boolean
  trigger?: React.ReactNode | null
}

export function EntryDialog({ onSuccess, onSubmit, isLoading = false, trigger }: EntryDialogProps) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      entry_date: new Date().toISOString().split("T")[0],
      status: "pending",
      total_value: 0,
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const { data: suppliers = [] } = useSuppliers()
  const { data: products = [] } = useProducts()
  const updateProduct = useUpdateProduct()

  const watchItems = watch("items")

  const recalculateTotalValue = () => {
    setTimeout(() => {
      const items = watch("items")
      const total = items?.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0) || 0
      setValue("total_value", total)
    }, 0)
  }

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p: any) => p.id === Number(productId))
    if (product) {
      setValue(`items.${index}.product_id`, product.id)
      setValue(`items.${index}.unit_price`, product.sale_price)
      const quantity = watchItems[index]?.quantity || 1
      const itemTotal = product.sale_price * quantity
      setValue(`items.${index}.total_price`, itemTotal)
      recalculateTotalValue()
    }
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    const unitPrice = watchItems[index]?.unit_price || 0
    const itemTotal = unitPrice * quantity
    setValue(`items.${index}.quantity`, quantity)
    setValue(`items.${index}.total_price`, itemTotal)
    recalculateTotalValue()
  }

  const addItem = () => {
    append({
      product_id: 0,
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      lot_number: "",
      expiration_date: "",
      received_at: new Date().toISOString(),
    })
  }

  const handleFormSubmit = async (data: EntryFormData) => {
    try {
      const formattedData = {
        ...data,
        entry_date: new Date(data.entry_date).toISOString(),
        items: data.items.map((item) => ({
          ...item,
          expiration_date: item.expiration_date ? new Date(item.expiration_date).toISOString() : undefined,
          received_at: item.received_at || new Date().toISOString(),
        })),
      }
      await onSubmit(formattedData)

      for (const item of data.items) {
        if (item.quantity > 0) {
          await updateProduct.mutateAsync({
            id: item.product_id,
            active: true,
          })
        }
      }

      reset()
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao salvar entrada:", error)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Entrada
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Entrada de Produtos</DialogTitle>
          <DialogDescription>Registre uma nova entrada de produtos no estoque</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Controller
                name="supplier_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((supplier: any) => (
                        <SelectItem key={supplier.id} value={String(supplier.id)}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.supplier_id && <p className="text-sm text-destructive">{errors.supplier_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Data da Entrada</Label>
              <Input type="date" {...register("entry_date")} />
              {errors.entry_date && <p className="text-sm text-destructive">{errors.entry_date.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número da Nota Fiscal</Label>
              <Input placeholder="Ex: NF-001234" {...register("invoice_number")} />
              {errors.invoice_number && <p className="text-sm text-destructive">{errors.invoice_number.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Valor Total</Label>
              <Input type="number" step="0.01" readOnly {...register("total_value")} className="bg-muted" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Itens da Entrada</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {errors.items && typeof errors.items.message === "string" && (
              <p className="text-sm text-destructive">{errors.items.message}</p>
            )}

            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="grid grid-cols-4 gap-3 items-end">
                  <div className="col-span-4 space-y-2">
                    <Label>Produto</Label>
                    <Controller
                      name={`items.${index}.product_id`}
                      control={control}
                      render={({ field: productField }) => (
                        <Select
                          onValueChange={(value) => {
                            productField.onChange(value)
                            handleProductChange(index, value)
                          }}
                          value={productField.value?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.map((product: any) => (
                              <SelectItem key={product.id} value={String(product.id)}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity`)}
                      onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Preço Unit.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      readOnly
                      {...register(`items.${index}.unit_price`)}
                      className="bg-muted"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Lote</Label>
                    <Input placeholder="Lote" {...register(`items.${index}.lot_number`)} />
                  </div>

                  <div className="col-span-1 space-y-2">
                    <Label>Total</Label>
                    <Input
                      type="number"
                      step="0.01"
                      readOnly
                      {...register(`items.${index}.total_price`)}
                      className="bg-muted"
                    />
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        remove(index)
                        recalculateTotalValue()
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="space-y-2">
                    <Label>Data de Validade</Label>
                    <Input type="date" {...register(`items.${index}.expiration_date`)} />
                  </div>
                </div>
              </Card>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                Nenhum item adicionado. Clique em &quot;Adicionar Item&quot; para começar.
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Entrada"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
