
import { BusinessDetails, AppSettings } from './types';

export const LOCAL_STORAGE_SETTINGS_KEY = 'invoiceAppSettings';
export const LOCAL_STORAGE_BUSINESS_DETAILS_KEY = 'invoiceBusinessDetails';
export const LOCAL_STORAGE_INVOICES_META_KEY = 'invoiceMetas';
export const LOCAL_STORAGE_INVOICE_PDF_PREFIX = 'invoicePdf_';
export const LOCAL_STORAGE_INVOICE_DATA_PREFIX = 'invoiceData_';
export const LOCAL_STORAGE_INVOICE_COUNTER_KEY = 'invoiceCounter';

export const DEFAULT_BUSINESS_DETAILS: BusinessDetails = {
  name: "اسم المؤسسة هنا",
  taxNumber: "123456789012345",
  commercialRegister: "1234567890",
  phone: "0500000000",
  website: "www.example.com",
  logo: null,
  address: "الرياض، المملكة العربية السعودية",
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  showTaxField: true,
  showDiscountField: true,
  showCommercialRegisterField: true,
  showWebsiteField: true,
  showBusinessAddressField: true,
  showClientAddressField: true,
  defaultTaxPercentage: 15,
  defaultDiscountPercentage: 0,
};

export const INVOICE_CURRENCY = "ر.س"; // ريال سعودي
