"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { Plus } from "lucide-react"
import { useCategories } from "@/lib/hooks/use-categories"
import { Controller } from "react-hook-form"


// SCHEMA corrigido
const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  cost_price: z.coerce.number().positive("Preço de compra deve ser positivo"),
  sale_price: z.coerce.number().positive("Preço de venda deve ser positivo"),
  description: z.string().optional(),
  active: z.boolean().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductDialogProps {
  onSuccess?: () => void
  onSubmit: (data: ProductFormData) => Promise<void>
  isLoading?: boolean
  trigger?: React.ReactNode | null
  defaultValues?: Partial<ProductFormData> | null
  onClose?: () => void
}

export function ProductDialog({ onSuccess, onSubmit, isLoading = false, trigger, defaultValues = null, onClose }: ProductDialogProps) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  const { data: categories = [] } = useCategories()

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
      setOpen(true)
    }
  }, [defaultValues, reset])

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit({ ...data, active: false })
      reset()
      setOpen(false)
      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      if (defaultValues) {
        reset()
        onClose?.()
      } else {
        reset()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!defaultValues && (
        <DialogTrigger asChild>
          {trigger || (
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          )}      
      </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>{defaultValues ? "Edite as informações do produto" : "Adicione um novo produto ao catálogo"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input id="name" placeholder="Ex: MacBook Pro" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" placeholder="Ex: MB-PRO-M3" {...register("sku")} />
            {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="category_id">Categoria</Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Preço de Compra</Label>
              <Input id="purchasePrice" type="number" step="0.01" placeholder="0.00" {...register("cost_price")} />
              {errors.cost_price && <p className="text-sm text-destructive">{errors.cost_price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePrice">Preço de Venda</Label>
              <Input id="salePrice" type="number" step="0.01" placeholder="0.00" {...register("sale_price")} />
              {errors.sale_price && <p className="text-sm text-destructive">{errors.sale_price.message}</p>}
            </div>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="minStock">Estoque Mínimo</Label>
            <Input id="minStock" type="number" placeholder="10" {...register("min_stock")} />
            {errors.min_stock && <p className="text-sm text-destructive">{errors.min_stock.message}</p>}
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" placeholder="Descrição do produto" {...register("description")} />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
