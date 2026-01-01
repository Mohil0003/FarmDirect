// API Types - DTOs and Request/Response types for API calls
// These types match the C# DTOs and API responses

// ========== USER TYPES ==========
export interface UserCreateDto {
  fullName: string;
  email: string;
  passwordHash: string;
  role: string;
  phoneNumber: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface UserResponse {
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

// Login request (assuming you'll add authentication)
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response (assuming you'll add JWT)
export interface LoginResponse {
  token?: string;
  user: UserResponse;
  role: string;
}

// ========== PRODUCT TYPES ==========
export interface ProductCreateDto {
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
}

export interface ProductResponse {
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

// ========== CATEGORY TYPES ==========
export interface CategoryCreateDto {
  categoryName: string;
  description?: string;
}

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  description?: string;
}

// ========== CART TYPES ==========
export interface CartCreateDto {
  consumerId: number;
  productId: number;
  quantity: number;
  addedAt?: string;
}

export interface CartResponse {
  cartId: number;
  consumerId: number;
  productId: number;
  quantity: number;
  addedAt?: string;
}

// ========== ORDER TYPES ==========
export interface OrderCreateDto {
  consumerId: number;
  orderDate?: string;
  totalAmount: number;
  status?: string;
  deliveryAddress: string;
}

export interface OrderResponse {
  orderId: number;
  consumerId: number;
  orderDate?: string;
  totalAmount: number;
  status?: string;
  deliveryAddress: string;
}

// ========== ORDER ITEM TYPES ==========
export interface OrderItemCreateDto {
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderItemResponse {
  orderItemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

// ========== PAYMENT TYPES ==========
export interface PaymentCreateDto {
  orderId: number;
  transactionId?: string;
  paymentMethod?: string;
  amount: number;
  status: string;
  paymentDate?: string;
}

export interface PaymentResponse {
  paymentId: number;
  orderId: number;
  transactionId?: string;
  paymentMethod?: string;
  amount: number;
  status: string;
  paymentDate?: string;
}

// ========== REVIEW TYPES ==========
export interface ReviewCreateDto {
  consumerId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface ReviewResponse {
  reviewId: number;
  consumerId: number;
  productId: number;
  rating?: number;
  comment?: string;
  createdAt?: string;
}

// ========== API ERROR RESPONSE ==========
export interface ApiErrorResponse {
  success: false;
  errors: string[];
}

// ========== API SUCCESS RESPONSE ==========
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

