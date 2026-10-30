export type Span = "full" | "half" | "third";

export type Category = {
  id: string;
  name: string;
  sort: number;
  span: Span;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  priceCents: number;
  stock: number;
  imageUrl: string;
  amazonUrl: string;
  published: boolean;
  sort: number;
};

export type PublicProduct = {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  imageUrl: string;
};

export type CatalogCategory = {
  id: string;
  name: string;
  sort: number;
  span: Span;
  products: PublicProduct[];
};

export type Settings = {
  monogram: string;
  siteName: string;
  title: string;
  subtitle: string;
  scriptNote: string;
  footerLine: string;
  currency: string;
  notifyEmail: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  bankNote: string;
  guestTemplate: string;
  ownerTemplate: string;
};

export type OrderStatus = "pendiente" | "recibido";

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  priceCents: number;
};

export type Order = {
  id: string;
  code: string;
  guestName: string;
  guestEmail: string;
  message: string;
  totalCents: number;
  status: OrderStatus;
  guestEmailSent: boolean;
  ownerEmailSent: boolean;
  emailNote: string;
  createdAt: string;
  items: OrderItem[];
};

export type StoreData = {
  settings: Settings;
  categories: Category[];
  products: Product[];
  orders: Order[];
};
