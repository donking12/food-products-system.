export enum ProductCategory {
  DAIRY = 'الألبان ومنتجاتها',
  GROCERIES = 'المواد الغذائية الجافة',
  BEVERAGES = 'المشروبات',
  FRESH = 'الخضروات والفواكه',
  BAKERY = 'المخبوزات',
  OTHER = 'أصناف أخرى',
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  units: number;
  stock: number;
  category: ProductCategory;
}

export enum UserRole {
  ADMIN = 'مدير',
  SALES = 'موظف مبيعات',
}

export interface User {
  username: string;
  role: UserRole;
}

export interface UserAuth extends User {
  password_plaintext: string;
  loginAttempts: number;
  lockoutUntil: number | null; // Timestamp
}

export interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  notes: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string; // ISO String format
  items: InvoiceItem[];
  total: number;
}
