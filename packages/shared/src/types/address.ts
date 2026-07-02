/** A saved shipping/billing address belonging to a user. */
export interface Address {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
