export interface DirectoryListing {
  id: string;
  businessName: string;
  zipCode: string;
  isClaimed: boolean;
  lat?: number;
  lng?: number;
  metaData?: Record<string, any>;
}

export interface SellerProfile {
  id: string;
  directoryListingId: string;
  ownerName: string;
  storeName?: string;
  fulfillmentMethods: string[];
  story: string;
  inventory: Product[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  batchType: string;
  stockLevel: number;
  images: string[];
}

export type MapPin = DirectoryListing & {
  sellerProfile?: SellerProfile;
};

/** A buyer/seller account profile (mirrors the `profiles` table). */
export interface Profile {
  id: string;
  name: string;
  defaultZip: string;
  isSeller: boolean;
}

/** A product placed in the cart (one row per add). */
export interface CartItem extends Product {
  cartId: string; // unique id for this instance in the cart
  sellerId: string;
  sellerName: string;
}

export type OrderStatus = 'pending' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  customerName: string;
  timestamp: Date;
}
