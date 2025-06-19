
export interface BusinessDetails {
  name: string;
  taxNumber: string;
  commercialRegister: string;
  phone: string;
  website: string;
  logo: string | null; // Base64 string for logo
  address: string;
}

export interface ClientDetails {
  name: string;
  phone: string;
  address: string; // الحي
}

export interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number; // 0-100
  taxPercentage: number; // 0-100
}

export interface CalculatedInvoiceItem extends InvoiceItem {
  discountAmount: number;
  priceAfterDiscount: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string; // Invoice number
  issueDate: string; // ISO string
  client: ClientDetails;
  items: InvoiceItem[];
  notes: string;
  businessDetails: BusinessDetails; // Snapshot of business details at time of creation
  settingsSnapshot: AppSettings; // Snapshot of app settings
}

export interface InvoiceSummary {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
}

export interface StoredInvoiceMeta {
  id: string;
  clientName: string;
  issueDate: string;
  grandTotal: number;
}

export interface AppSettings {
  showTaxField: boolean;
  showDiscountField: boolean;
  showCommercialRegisterField: boolean;
  showWebsiteField: boolean;
  showBusinessAddressField: boolean;
  showClientAddressField: boolean;
  defaultTaxPercentage: number;
  defaultDiscountPercentage: number;
}

export interface ShareFile {
  name: string;
  type: string;
  base64: string;
}
