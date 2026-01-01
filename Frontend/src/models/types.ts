// TypeScript interfaces generated from C# models
// Properties converted from PascalCase to camelCase

export interface User {
  userId: number;
  fullName: string;
  email: string;
  passwordHash: string;
  role: string;
  phoneNumber: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
}

export interface Product {
  productId: number;
  farmerId: number;
  categoryId: number;
  name: string;
  description?: string;
  basePrice: number;
  currentPrice: number;
  stockQuantity: number;
  unit: string;
  harvestDate: string;
  expiryDate: string;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
}

export interface Cart {
  cartId: number;
  consumerId: number;
  productId: number;
  quantity: number;
  addedAt?: string;
}

export interface Order {
  orderId: number;
  consumerId: number;
  orderDate?: string;
  totalAmount: number;
  status?: string;
  deliveryAddress: string;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface Payment {
  paymentId: number;
  orderId: number;
  transactionId?: string;
  paymentMethod?: string;
  amount: number;
  status: string;
  paymentDate?: string;
}

export interface Review {
  reviewId: number;
  consumerId: number;
  productId: number;
  rating?: number;
  comment?: string;
  createdAt?: string;
}

export interface AuditLog {
  logId: number;
  action?: string;
  tableName?: string;
  recordId?: number;
  details?: string;
  timestamp?: string;
}

