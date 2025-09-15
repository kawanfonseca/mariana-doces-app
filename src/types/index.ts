export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR';
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  active: boolean;
  currentStock: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIngredientRequest {
  name: string;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  currentStock?: number;
  minStock?: number;
}

export interface Packaging {
  id: string;
  name: string;
  unitCost: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackagingRequest {
  name: string;
  unitCost: number;
}

export interface Product {
  id: string;
  name: string;
  channelBasePriceDirect?: number;
  channelBasePriceIFood?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  laborCostPreset?: LaborCostPreset;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  channelBasePriceDirect?: number;
  channelBasePriceIFood?: number;
}

export interface RecipeItem {
  id: string;
  ingredientId: string;
  qty: number;
  wastePct?: number;
  ingredient: Ingredient;
}

export interface PackagingUsage {
  id: string;
  packagingId: string;
  qty: number;
  packaging: Packaging;
}

export interface LaborCostPreset {
  id: string;
  name: string;
  minutesPerBatch: number;
  batchYield: number;
  laborRatePerHour: number;
}

export interface ProductRecipe {
  recipeItems: RecipeItem[];
  packagingUsages: PackagingUsage[];
  laborCostPreset?: LaborCostPreset;
}

export interface UpdateProductRecipeRequest {
  recipeItems: {
    ingredientId: string;
    qty: number;
    wastePct?: number;
  }[];
  packagingUsages: {
    packagingId: string;
    qty: number;
  }[];
  laborCostPreset?: {
    name: string;
    minutesPerBatch: number;
    batchYield: number;
    laborRatePerHour: number;
  };
}

export interface PricingPreview {
  productId: string;
  productName: string;
  ingredientsCost: number;
  packagingCost: number;
  laborCost: number;
  totalUnitCost: number;
  suggestedPriceDirect: number;
  suggestedPriceIFood: number;
  marginDirect: {
    percent: number;
    value: number;
  };
  marginIFood: {
    percent: number;
    value: number;
  };
}

export interface SaleOrder {
  id: string;
  date: string;
  channel: 'DIRECT' | 'IFOOD';
  grossAmount: number;
  discounts: number;
  platformFees: number;
  costs: number;
  netAmount: number;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  productId?: string;
  variantId?: string;
  qty: number;
  unitPrice: number;
  lineGross: number;
  lineDiscount: number;
  lineNet: number;
  product?: {
    id: string;
    name: string;
  };
  variant?: {
    id: string;
    name: string;
  };
}

export interface CreateSaleOrderRequest {
  date: string;
  channel: 'DIRECT' | 'IFOOD';
  items: {
    productId?: string;
    variantId?: string;
    qty: number;
    unitPrice: number;
  }[];
  discounts?: number;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface ReportSummary {
  period: {
    from: string;
    to: string;
  };
  channel?: 'DIRECT' | 'IFOOD';
  grossRevenue: number;
  discounts: number;
  platformFees: number;
  costs: number;
  netRevenue: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface ProductReport {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  costs: number;
  profit: number;
  marginPercent: number;
}

export interface Config {
  [key: string]: {
    value: string;
    description?: string;
  };
}

export interface CsvImportResult {
  success: boolean;
  message: string;
  processedRows: number;
  errors: string[];
  orderId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  error: string;
  details?: string | { field: string; message: string }[];
}

export interface StockMovement {
  id: string;
  ingredientId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  notes?: string;
  createdAt: string;
  ingredient: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface CreateStockMovementRequest {
  ingredientId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  notes?: string;
}

export interface ProductCostAnalysis {
  productId: string;
  productName: string;
  ingredientsCost: number;
  packagingCost: number;
  laborCost: number;
  totalCost: number;
  sellingPrice: number;
  profit: number;
  profitMargin: number;
  recipeItems: {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    costPerUnit: number;
    totalCost: number;
  }[];
}
