
import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Trash2, Search, Download } from 'lucide-react';
import { StoredInvoiceMeta } from '../types';
import { 
  LOCAL_STORAGE_INVOICES_META_KEY,
  LOCAL_STORAGE_INVOICE_PDF_PREFIX,
  LOCAL_STORAGE_INVOICE_DATA_PREFIX,
  INVOICE_CURRENCY
} from '../constants';

const ArchivePage: React.FC = () => {
  const [invoices, setInvoices] = useState<StoredInvoiceMeta[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedMetas = localStorage.getItem(LOCAL_STORAGE_INVOICES_META_KEY);
    if (storedMetas) {
      setInvoices(JSON.parse(storedMetas).sort((a: StoredInvoiceMeta, b: StoredInvoiceMeta) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
    }
    setLoading(false);
  }, []);

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    return invoices.filter(invoice =>
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(invoice.issueDate).toLocaleDateString('ar-SA').includes(searchTerm)
    );
  }, [invoices, searchTerm]);

  const handleDelete = (invoiceId: string) => {
    if (window.confirm(`هل أنت متأكد أنك تريد حذف الفاتورة رقم ${invoiceId}؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      localStorage.removeItem(`${LOCAL_STORAGE_INVOICE_PDF_PREFIX}${invoiceId}`);
      localStorage.removeItem(`${LOCAL_STORAGE_INVOICE_DATA_PREFIX}${invoiceId}`);
      const updatedMetas = invoices.filter(inv => inv.id !== invoiceId);
      setInvoices(updatedMetas);
      localStorage.setItem(LOCAL_STORAGE_INVOICES_META_KEY, JSON.stringify(updatedMetas));
    }
  };

  const handlePreview = (invoiceId: string) => {
    const pdfBase64 = localStorage.getItem(`${LOCAL_STORAGE_INVOICE_PDF_PREFIX}${invoiceId}`);
    if (pdfBase64) {
      // For browsers that block data URI in new tab, try opening in iframe or using blob URL
      try {
        const byteCharacters = atob(pdfBase64.substring(pdfBase64.indexOf(',') + 1));
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        URL.revokeObjectURL(url); // Clean up
      } catch (e) {
        console.error("Error opening PDF: ", e);
        alert("فشل في فتح ملف PDF. قد يكون الملف تالفًا أو أن المتصفح لا يدعم هذه الميزة.");
      }
    } else {
      alert('لم يتم العثور على ملف PDF لهذه الفاتورة.');
    }
  };
  
  const handleDownload = (invoiceId: string) => {
    const pdfBase64 = localStorage.getItem(`${LOCAL_STORAGE_INVOICE_PDF_PREFIX}${invoiceId}`);
    if (pdfBase64) {
      const link = document.createElement('a');
      link.href = pdfBase64;
      link.download = `فاتورة-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('لم يتم العثور على ملف PDF لهذه الفاتورة.');
    }
  };

  if (loading) {
    return <div className="text-center py-10">جاري تحميل الأرشيف...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn p-4 md:p-6 bg-glass backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
      <h2 className="text-2xl font-bold text-primary mb-6">أرشيف الفواتير</h2>
      
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="ابحث بالرقم، اسم العميل، أو التاريخ..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white/80 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>

      {filteredInvoices.length === 0 ? (
        <p className="text-center text-neutral py-8">لا توجد فواتير محفوظة تطابق بحثك أو لم يتم إنشاء فواتير بعد.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200/50">
          <table className="w-full min-w-[700px] text-sm text-right bg-white">
            <thead className="bg-primary/10 text-primary">
              <tr>
                <th className="p-3">رقم الفاتورة</th>
                <th className="p-3">اسم العميل</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الإجمالي</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50/70 transition-colors">
                  <td className="p-3 font-medium">{invoice.id}</td>
                  <td className="p-3">{invoice.clientName}</td>
                  <td className="p-3">{new Date(invoice.issueDate).toLocaleDateString('ar-SA')}</td>
                  <td className="p-3">{invoice.grandTotal.toFixed(2)} {INVOICE_CURRENCY}</td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handlePreview(invoice.id)} 
                      className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors mx-1" 
                      title="معاينة PDF"
                    >
                      <Eye size={18} />
                    </button>
                     <button 
                      onClick={() => handleDownload(invoice.id)} 
                      className="p-1.5 text-green-600 hover:text-green-800 transition-colors mx-1" 
                      title="تنزيل PDF"
                    >
                      <Download size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(invoice.id)} 
                      className="p-1.5 text-red-500 hover:text-red-700 transition-colors mx-1" 
                      title="حذف الفاتورة"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ArchivePage;
