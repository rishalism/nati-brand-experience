import type { OrderStatus, PaymentMethod, PaymentStatus } from "../constants/enums";

export interface OrderItemView {
  id: string;
  productId: string | null;
  name: string;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  image: string | null;
}

export interface OrderAddress {
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
}

export interface PaymentView {
  provider: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  providerOrderId: string | null;
  providerPaymentId: string | null;
}

export interface OrderView {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  address: OrderAddress;
  items: OrderItemView[];
  payment: PaymentView | null;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** Slim order for history lists. */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  currency: string;
  itemCount: number;
  placedAt: string;
}

/** Result of initiating checkout. For Razorpay, `payment` carries the params
 * the browser SDK needs; for COD it's null (order already placed). */
export interface CheckoutResult {
  order: OrderView;
  razorpay: {
    keyId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
  } | null;
}

export interface Invoice {
  invoiceNumber: string;
  orderNumber: string;
  issuedAt: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
  address: OrderAddress;
  items: OrderItemView[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
