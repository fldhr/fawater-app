
import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Trash2, Share2, AlertTriangle, CheckCircle } from 'lucide-react';
import { InvoiceItem, ClientDetails, BusinessDetails, AppSettings, CalculatedInvoiceItem, Invoice, InvoiceSummary, ShareFile } from '../types';
import { generateInvoicePdf } from '../services/pdfGenerator';
import { 
  LOCAL_STORAGE_SETTINGS_KEY, 
  LOCAL_STORAGE_BUSINESS_DETAILS_KEY,
  LOCAL_STORAGE_INVOICES_META_KEY,
  LOCAL_STORAGE_INVOICE_PDF_PREFIX,
  LOCAL_STORAGE_INVOICE_DATA_PREFIX,
  LOCAL_STORAGE_INVOICE_COUNTER_KEY,
  DEFAULT_APP_SETTINGS, 
  DEFAULT_BUSINESS_DETAILS,
  INVOICE_CURRENCY
} from '../constants';

const CreateInvoicePage: React.FC = () => {
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>(DEFAULT_BUSINESS_DETAILS);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  
  const [invoiceId, setInvoiceId] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [clientDetails, setClientDetails] = useState<ClientDetails>({ name: '', phone: '', address: '' });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shareStatus, setShareStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const storedBusinessDetails = localStorage.getItem(LOCAL_STORAGE_BUSINESS_DETAILS_KEY);
    if (storedBusinessDetails) {
      setBusinessDetails(JSON.parse(storedBusinessDetails));
    }
    const storedAppSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (storedAppSettings) {
      setAppSettings(JSON.parse(storedAppSettings));
    }
    generateNewInvoiceId();
    addInitialItem();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateNewInvoiceId = () => {
    const counter = parseInt(localStorage.getItem(LOCAL_STORAGE_INVOICE_COUNTER_KEY) || '0', 10) + 1;
    localStorage.setItem(LOCAL_STORAGE_INVOICE_COUNTER_KEY, counter.toString());
    // Format: YYYYMMDD-COUNTER
    const datePrefix = new Date().toISOString().slice(0,10).replace(/-/g,"");
    setInvoiceId(`INV-${datePrefix}-${counter.toString().padStart(4, '0')}`);
  };

  const addInitialItem = useCallback(() => {
    setItems([{
      id: Date.now().toString(),
      productName: '',
      quantity: 1,
      unitPrice: 0,
      discountPercentage: appSettings.defaultDiscountPercentage,
      taxPercentage: appSettings.defaultTaxPercentage,
    }]);
  }, [appSettings.defaultDiscountPercentage, appSettings.defaultTaxPercentage]);

  const handleItemChange = <K extends keyof InvoiceItem>(index: number, field: K, value: InvoiceItem[K]) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      productName: '',
      quantity: 1,
      unitPrice: 0,
      discountPercentage: appSettings.defaultDiscountPercentage,
      taxPercentage: appSettings.defaultTaxPercentage,
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    } else {
      // Clear the last item instead of removing it
      setItems([{
        id: Date.now().toString(),
        productName: '',
        quantity: 1,
        unitPrice: 0,
        discountPercentage: appSettings.defaultDiscountPercentage,
        taxPercentage: appSettings.defaultTaxPercentage,
      }]);
    }
  };

  const calculateInvoiceDetails = useCallback((): { calculatedItems: CalculatedInvoiceItem[], summary: InvoiceSummary } => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const calculatedItems: CalculatedInvoiceItem[] = items.map(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const discountAmount = appSettings.showDiscountField ? (itemSubtotal * (item.discountPercentage / 100)) : 0;
      const priceAfterDiscount = itemSubtotal - discountAmount;
      const taxAmount = appSettings.showTaxField ? (priceAfterDiscount * (item.taxPercentage / 100)) : 0;
      const total = priceAfterDiscount + taxAmount;

      subtotal += itemSubtotal; // Subtotal before discount
      totalDiscount += discountAmount;
      totalTax += taxAmount;

      return { ...item, discountAmount, priceAfterDiscount, taxAmount, total };
    });
    
    // The subtotal in the summary is typically the sum of (quantity * unitPrice) for all items
    // If it's meant to be sum of (priceAfterDiscount), the definition changes
    const grandTotal = subtotal - totalDiscount + totalTax;

    return {
      calculatedItems,
      summary: { subtotal, totalDiscount, totalTax, grandTotal }
    };
  }, [items, appSettings.showDiscountField, appSettings.showTaxField]);

  const { calculatedItems, summary } = calculateInvoiceDetails();

  const handleShareInvoice = async () => {
    if (!clientDetails.name) {
      setShareStatus({ type: 'error', message: 'الرجاء إدخال اسم العميل.' });
      return;
    }
    if (items.some(item => !item.productName || item.quantity <= 0 || item.unitPrice < 0)) {
       setShareStatus({ type: 'error', message: 'الرجاء التأكد من صحة بيانات جميع المنتجات/الخدمات (الاسم، الكمية أكبر من صفر، السعر صالح).' });
      return;
    }

    setIsLoading(true);
    setShareStatus(null);

    const fullInvoiceData: Invoice = {
      id: invoiceId,
      issueDate,
      client: clientDetails,
      items, // Store original items, PDF uses calculated ones
      notes,
      businessDetails,
      settingsSnapshot: appSettings,
    };

    try {
      const pdfBase64 = await generateInvoicePdf(fullInvoiceData, calculatedItems, summary);
      
      // Store PDF and invoice data in localStorage
      localStorage.setItem(`${LOCAL_STORAGE_INVOICE_PDF_PREFIX}${invoiceId}`, pdfBase64);
      localStorage.setItem(`${LOCAL_STORAGE_INVOICE_DATA_PREFIX}${invoiceId}`, JSON.stringify(fullInvoiceData));

      const storedMetasString = localStorage.getItem(LOCAL_STORAGE_INVOICES_META_KEY);
      const metas = storedMetasString ? JSON.parse(storedMetasString) : [];
      metas.push({
        id: invoiceId,
        clientName: clientDetails.name,
        issueDate,
        grandTotal: summary.grandTotal,
      });
      localStorage.setItem(LOCAL_STORAGE_INVOICES_META_KEY, JSON.stringify(metas));

      // Prepare file for navigator.share
      const byteCharacters = atob(pdfBase64.substring(pdfBase64.indexOf(',') + 1));
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const pdfFile = new File([blob], `فاتورة-${invoiceId}.pdf`, { type: 'application/pdf' });

      if (navigator.share) {
        await navigator.share({
          title: `فاتورة ${invoiceId}`,
          text: `فاتورة رقم ${invoiceId} من ${businessDetails.name}`,
          files: [pdfFile],
        });
        setShareStatus({ type: 'success', message: 'تمت مشاركة الفاتورة وتخزينها بنجاح!' });
      } else {
        // Fallback for browsers not supporting navigator.share with files
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `فاتورة-${invoiceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShareStatus({ type: 'success', message: 'تم إنشاء الفاتورة وتنزيلها. المشاركة غير مدعومة بالكامل في هذا المتصفح.' });
      }
      
      // Reset form for next invoice
      generateNewInvoiceId();
      setClientDetails({ name: '', phone: '', address: '' });
      addInitialItem();
      setNotes('');

    } catch (error) {
      console.error("Error sharing invoice:", error);
      setShareStatus({ type: 'error', message: `فشل إنشاء أو مشاركة الفاتورة: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setIsLoading(false);
      setTimeout(() => setShareStatus(null), 5000); // Clear status message after 5 seconds
    }
  };

  const inputClass = "w-full p-2.5 border border-gray-300 rounded-lg bg-white/80 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-sm";
  const labelClass = "block mb-1.5 text-sm font-medium text-neutral-dark";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <section className="p-6 bg-glass backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-primary">{businessDetails.name}</h2>
            {businessDetails.taxNumber && <p className="text-sm">الرقم الضريبي: {businessDetails.taxNumber}</p>}
            {appSettings.showCommercialRegisterField && businessDetails.commercialRegister && <p className="text-sm">السجل التجاري: {businessDetails.commercialRegister}</p>}
            {businessDetails.phone && <p className="text-sm">الهاتف: {businessDetails.phone}</p>}
            {appSettings.showWebsiteField && businessDetails.website && <p className="text-sm">الموقع: {businessDetails.website}</p>}
            {appSettings.showBusinessAddressField && businessDetails.address && <p className="text-sm">العنوان: {businessDetails.address}</p>}
          </div>
          {businessDetails.logo && (
            <img src={businessDetails.logo} alt="شعار المؤسسة" className="w-24 h-24 object-contain rounded-md bg-white p-1 shadow-sm" />
          )}
        </div>
      </section>

      {/* Client Details & Invoice Info */}
      <section className="p-6 bg-glass backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-semibold mb-4 text-secondary border-b-2 border-secondary/30 pb-2">بيانات الفاتورة والعميل</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="invoiceId" className={labelClass}>رقم الفاتورة</label>
            <input type="text" id="invoiceIdInput" value={invoiceId} readOnly className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
          </div>
          <div>
            <label htmlFor="issueDate" className={labelClass}>تاريخ الإصدار</label>
            <input type="date" id="issueDate" value={issueDate} onChange={e => setIssueDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="clientName" className={labelClass}>اسم العميل <span className="text-red-500">*</span></label>
            <input type="text" id="clientName" value={clientDetails.name} onChange={e => setClientDetails({...clientDetails, name: e.target.value})} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="clientPhone" className={labelClass}>رقم جوال العميل</label>
            <input type="tel" id="clientPhone" value={clientDetails.phone} onChange={e => setClientDetails({...clientDetails, phone: e.target.value})} className={inputClass} />
          </div>
          {appSettings.showClientAddressField && (
            <div className="md:col-span-2 lg:col-span-1">
              <label htmlFor="clientAddress" className={labelClass}>الحي / العنوان</label>
              <input type="text" id="clientAddress" value={clientDetails.address} onChange={e => setClientDetails({...clientDetails, address: e.target.value})} className={inputClass} />
            </div>
          )}
        </div>
      </section>

      {/* Invoice Items Table */}
      <section className="p-6 bg-glass backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4 text-secondary border-b-2 border-secondary/30 pb-2">تفاصيل المنتجات / الخدمات</h3>
        <table className="w-full min-w-[800px] text-sm text-right">
          <thead className="bg-primary/10 text-primary">
            <tr>
              <th className="p-2.5">المنتج/الخدمة <span className="text-red-500">*</span></th>
              <th className="p-2.5 w-24">الكمية <span className="text-red-500">*</span></th>
              <th className="p-2.5 w-32">سعر الوحدة <span className="text-red-500">*</span></th>
              {appSettings.showDiscountField && <th className="p-2.5 w-28">الخصم %</th>}
              {appSettings.showTaxField && <th className="p-2.5 w-28">الضريبة %</th>}
              {appSettings.showTaxField && <th className="p-2.5 w-32">قيمة الضريبة</th>}
              <th className="p-2.5 w-36">الإجمالي</th>
              <th className="p-2.5 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {calculatedItems.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-white/50 transition-colors">
                <td className="p-2"><input type="text" value={item.productName} onChange={e => handleItemChange(index, 'productName', e.target.value)} placeholder="اسم المنتج" className={inputClass} required/></td>
                <td className="p-2"><input type="number" value={item.quantity} min="1" onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)} className={inputClass} required/></td>
                <td className="p-2"><input type="number" value={item.unitPrice} min="0" step="0.01" onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} className={inputClass} required/></td>
                {appSettings.showDiscountField && <td className="p-2"><input type="number" value={item.discountPercentage} min="0" max="100" step="0.01" onChange={e => handleItemChange(index, 'discountPercentage', parseFloat(e.target.value) || 0)} className={inputClass} /></td>}
                {appSettings.showTaxField && <td className="p-2"><input type="number" value={item.taxPercentage} min="0" max="100" step="0.01" onChange={e => handleItemChange(index, 'taxPercentage', parseFloat(e.target.value) || 0)} className={inputClass} /></td>}
                {appSettings.showTaxField && <td className="p-2"><input type="text" value={`${item.taxAmount.toFixed(2)} ${INVOICE_CURRENCY}`} readOnly className={`${inputClass} bg-gray-100`} /></td>}
                <td className="p-2"><input type="text" value={`${item.total.toFixed(2)} ${INVOICE_CURRENCY}`} readOnly className={`${inputClass} bg-gray-100 font-semibold`} /></td>
                <td className="p-2 text-center">
                  <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 transition-colors" title="حذف البند">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addItem} className="mt-4 flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-accent hover:bg-emerald-600 text-white rounded-lg shadow-sm transition-colors">
          <PlusCircle size={18} />
          <span>إضافة بند جديد</span>
        </button>
      </section>

      {/* Financial Summary & Notes */}
      <section className="p-6 bg-glass backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-secondary">الملاحظات</h3>
            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} className={`${inputClass} min-h-[100px]`} placeholder="أضف ملاحظات إضافية هنا..."></textarea>
          </div>
          <div className="space-y-2 text-sm">
            <h3 className="text-xl font-semibold mb-3 text-secondary">الملخص المالي</h3>
            <div className="flex justify-between items-center p-2 rounded-md bg-gray-50">
              <span>المجموع الفرعي:</span>
              <span className="font-medium">{summary.subtotal.toFixed(2)} {INVOICE_CURRENCY}</span>
            </div>
            {appSettings.showDiscountField && (
              <div className="flex justify-between items-center p-2 rounded-md bg-gray-50">
                <span>إجمالي الخصم:</span>
                <span className="font-medium text-red-600">-{summary.totalDiscount.toFixed(2)} {INVOICE_CURRENCY}</span>
              </div>
            )}
            {appSettings.showTaxField && (
              <div className="flex justify-between items-center p-2 rounded-md bg-gray-50">
                <span>إجمالي الضريبة ({appSettings.defaultTaxPercentage}% تقديريًا):</span>
                <span className="font-medium">{summary.totalTax.toFixed(2)} {INVOICE_CURRENCY}</span>
              </div>
            )}
            <div className="flex justify-between items-center p-3 mt-2 rounded-md bg-primary text-white text-lg font-bold shadow">
              <span>الإجمالي النهائي:</span>
              <span>{summary.grandTotal.toFixed(2)} {INVOICE_CURRENCY}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Action Button & Status Message */}
      <section className="text-center py-4">
        {shareStatus && (
          <div className={`mb-4 p-3 rounded-md text-sm flex items-center justify-center space-x-2 rtl:space-x-reverse ${shareStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {shareStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span>{shareStatus.message}</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleShareInvoice}
          disabled={isLoading}
          className="px-8 py-3 bg-secondary hover:bg-indigo-700 text-white text-lg font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse mx-auto"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Share2 size={22} />
          )}
          <span>{isLoading ? 'جاري المعالجة...' : 'مشاركة وحفظ الفاتورة'}</span>
        </button>
      </section>
    </div>
  );
};

export default CreateInvoicePage;
