// User Types
export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

export interface UserProfile extends User {
  address?: Address;
  preferences?: UserPreferences;
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    showProfile: boolean;
    showPurchaseHistory: boolean;
  };
}

// Product Types
export type ProductCategory =
  | 'BEEF'
  | 'PORK'
  | 'CHICKEN'
  | 'LAMB'
  | 'SEAFOOD'
  | 'GAME'
  | 'OTHER';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: ProductCategory;
  price: number;
  unit: string; // e.g., 'lb', 'kg', 'piece'
  images: string[];
  inventory: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  seller?: SellerProfile;
  averageRating?: number;
  reviewCount?: number;
}

export interface ProductDetails extends Product {
  specifications: Record<string, string>;
  sourcingInfo: {
    farmName?: string;
    location?: string;
    certifications?: string[];
    productionMethod?: string;
  };
}

// Seller Types
export interface SellerProfile {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  logoUrl?: string;
  location?: string;
  certifications: string[];
  rating: number;
  totalSales: number;
  joinedAt: string;
  verified: boolean;
}

// Order Types
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  product?: Product;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  paymentIntentId?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

// Group Purchase Types
export type GroupPurchaseStatus =
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface PriceTier {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  discountPercentage: number;
}

export interface GroupPurchase {
  id: string;
  productId: string;
  organizerId: string;
  title: string;
  description?: string;
  status: GroupPurchaseStatus;
  priceTiers: PriceTier[];
  minimumQuantity: number;
  targetQuantity: number;
  currentQuantity: number;
  participantCount: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  organizer?: User;
}

export interface GroupParticipant {
  id: string;
  groupId: string;
  userId: string;
  quantity: number;
  joinedAt: string;
  user?: User;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  groupPurchaseId?: string;
  product?: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  estimatedTax: number;
  estimatedTotal: number;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  verified: boolean; // verified purchase
  helpful: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Community Types
export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  threadCount: number;
}

export interface ForumThread {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  content: string;
  pinned: boolean;
  locked: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  author?: User;
}

export interface ForumReply {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

// Message Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: User;
}

export interface Conversation {
  id: string;
  participants: string[]; // user IDs
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

// Analytics Types
export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    name: string;
    revenue: number;
    unitsSold: number;
  }>;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
  }>;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Payment Types
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  isDefault: boolean;
}

// Notification Types
export type NotificationType =
  | 'ORDER_UPDATE'
  | 'GROUP_PURCHASE_UPDATE'
  | 'MESSAGE'
  | 'REVIEW'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}
