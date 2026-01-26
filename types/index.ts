export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "user"
}

export interface EstoqueValor {
  __root__?: {
    valor_estoque_final: number
  }
}

export interface TopCategoriaAPI {
  __root__: {
    nome_categoria: string;
    total_vendas: number;
    quantidade_vendida: number;
    valor_total: string;
    lucro_total: string;
  }
}

export interface CategoryChartData {
  name: string;
  value: number;
}

export interface TopProdutoAPI {
  __root__: {
    sk_produto: number;
    nome_produto: string;
    nome_categoria: string;
    quantidade_vendida: number;
    valor_total: string;
    lucro_total: string;
    numero_vendas: number;
  };
};

export interface VendaSemanais {
  __root__: {
    ano: number
    semana: number
    inicio_semana: string
    valor_total_vendas: string
    lucro_total: string
    margem_lucro_media: string
  }
}

export interface Product {
  id: string
  name: string
  sku: string
  categoryId: string
  supplierId?: string
  purchasePrice: number
  salePrice: number
  minStock: number
  currentStock: number
  image?: string
  description?: string
  active: boolean
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  productCount?: number
}

export interface Supplier {
  id: string
  name: string
  cnpj: string
  phone: string
  email?: string
  address?: string
}

export interface Client {
  id: string
  name: string
  cpfCnpj: string
  email?: string
  phone?: string
  address?: string
}

export interface Store {
  id: string
  name: string
  address: string
  phone?: string
  manager?: string
}

export interface Entry {
  id: string
  supplierId: string
  storeId: string
  date: string
  items: EntryItem[]
  totalCost: number
}

export interface EntryItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
}

export interface Sale {
  id: string
  clientId: string
  storeId: string
  date: string
  items: SaleItem[]
  totalAmount: number
  deliveryType: "pickup" | "delivery"
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  tracking?: string
}

export interface SaleItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
}

export interface StockMovement {
  id: string
  productId: string
  storeId: string
  type: "entry" | "sale" | "transfer" | "adjustment"
  quantity: number
  previousStock: number
  newStock: number
  userId: string
  date: string
  reference?: string
}

export interface StockStore {
  id: string
  productId: string
  storeId: string
  quantity: number
  minStock: number
}

export interface InternalDistribution {
  id: string
  originStoreId: string
  destinyStoreId: string
  date: string
  items: InternalDistributionItem[]
  status: "pending" | "completed"
}

export interface InternalDistributionItem {
  id: string
  productId: string
  quantity: number
}

export interface DashboardStats {
  totalStockValue: number
  stockCost: number
  predictedProfit: number
  lowStockProducts: number
  outOfStockProducts: number
  recentEntries: number
  recentSales: number
  dailySales: number
}
