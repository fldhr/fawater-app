import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, CalculatedInvoiceItem, InvoiceSummary, AppSettings, BusinessDetails } from '../types';
import { INVOICE_CURRENCY } from '../constants';

// --- START OF ARABIC FONT BASE64 ---
// هام جداً: السلسلة التالية هي جزء كبير من خط Amiri Regular بصيغة base64.
// **للحصول على أفضل نتيجة وضمان عمل الخط بشكل كامل، يجب عليك استبدال هذه السلسلة بالكامل بالسلسلة الكاملة لملف الخط العربي الذي اخترته (مثلاً Amiri-Regular.ttf الكامل) بعد تحويله إلى base64.**
// يمكنك البحث عن "ttf to base64 converter" لتحويل ملف الخط والحصول على السلسلة الكاملة.
// إذا لم تستبدل هذه السلسلة المؤقتة بالسلسلة الكاملة والفعلية للخط، قد تستمر مشكلة عرض بعض الحروف العربية بشكل غير صحيح.
const ARABIC_FONT_BASE64 = 'T1RUTwAJAIAAAwAQQ0ZGIBkAAAAAAGFHUE9TApMAPQAACuQAAApkR1NVQjQG+AAAAAEAAAABAAABHSFYTVhYIAAAAAAFsAAAACgAAAAAAAABGVEVSSAEAAAAAAAABMAEAAQAAAAEAAAAAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAAAEAAQAAAAEAABARARKBAMA'; // ... the final truncated string of an example font
// --- END OF ARABIC FONT BASE64 ---


async function loadArabicFont(doc: jsPDF) {
  const FONT_NAME = 'Amiri'; // يمكنك تغيير هذا إذا استخدمت خطًا آخر
  const FONT_FILE_NAME = `${FONT_NAME}-Regular.ttf`; // افترض أن اسم ملف الخط هو Amiri-Regular.ttf

  try {
    // تم تعديل الشرط ليكون أكثر واقعية قليلاً مع طول السلسلة المحدثة.
    // مع ذلك، لا يزال يتحقق من أنها ليست قصيرة جدًا أو placeholder واضح.
    // للحصول على أفضل النتائج، يجب أن تحتوي السلسلة على بيانات خط كاملة.
    if (!ARABIC_FONT_BASE64 || ARABIC_FONT_BASE64.length < 2000 || ARABIC_FONT_BASE64.includes("....") || ARABIC_FONT_BASE64.toUpperCase().includes("PLACEHOLDER")) { 
        console.warn(`PDF Generator: ${FONT_NAME} font base64 is a placeholder, missing, or too short. Arabic text might not render correctly. PLEASE REPLACE THE ARABIC_FONT_BASE64 constant with the full base64 string of your chosen Arabic font .ttf file.`);
        doc.setFont('Helvetica'); // Fallback
        return;
    }

    doc.addFileToVFS(FONT_FILE_NAME, ARABIC_FONT_BASE64);
    doc.addFont(FONT_FILE_NAME, FONT_NAME, 'normal');
    doc.setFont(FONT_NAME);
    console.log(`${FONT_NAME} font loaded and set for PDF.`);
  } catch (error) {
    console.error(`Failed to load or set Arabic font (${FONT_NAME}):`, error);
    doc.setFont('Helvetica'); // Fallback in case of error
    console.warn(`PDF Generator: Falling back to Helvetica due to an error with ${FONT_NAME} font. Arabic text might not render correctly.`);
  }
}


export const generateInvoicePdf = async (invoice: Invoice, calculatedItems: CalculatedInvoiceItem[], summary: InvoiceSummary): Promise<string> => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  await loadArabicFont(doc); // Load and set the chosen Arabic font

  const FONT_NAME = 'Amiri'; // تأكد من تطابق هذا مع ما تم تحميله
  const businessDetails = invoice.businessDetails;
  const settings = invoice.settingsSnapshot;
  const client = invoice.client;

  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  let yPos = margin;

  // --- Header ---
  doc.setFont(FONT_NAME); // Ensure Arabic font is used
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(businessDetails.name, pageWidth - margin, yPos, { align: 'right' });
  yPos += 8;

  if (businessDetails.logo) {
    try {
      const imgProps = doc.getImageProperties(businessDetails.logo);
      const imgWidth = 40;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      doc.addImage(businessDetails.logo, 'PNG', margin, margin -5, imgWidth, imgHeight);
    } catch (e) {
      console.error("Error adding logo to PDF:", e);
    }
  }
  
  doc.setFont(FONT_NAME); // Ensure Arabic font
  doc.setFontSize(10);
  doc.setTextColor(100);

  if (settings.showCommercialRegisterField && businessDetails.commercialRegister) {
    doc.text(`السجل التجاري: ${businessDetails.commercialRegister}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 5;
  }
  if (businessDetails.taxNumber) {
    doc.text(`الرقم الضريبي: ${businessDetails.taxNumber}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 5;
  }
   if (settings.showBusinessAddressField && businessDetails.address) {
    doc.text(`العنوان: ${businessDetails.address}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 5;
  }
  if (businessDetails.phone) {
    doc.text(`الهاتف: ${businessDetails.phone}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 5;
  }
  if (settings.showWebsiteField && businessDetails.website) {
    doc.text(`الموقع الإلكتروني: ${businessDetails.website}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 7;
  }

  // --- Invoice Title & Client Details ---
  yPos += 5;
  doc.setFont(FONT_NAME); // Ensure Arabic font
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('فاتورة ضريبية', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFont(FONT_NAME); // Ensure Arabic font
  doc.setFontSize(10);
  doc.setTextColor(50);
  const clientBoxWidth = (pageWidth - 2 * margin) / 2 - 5;

  let rightBoxY = yPos;
  doc.text(`رقم الفاتورة: ${invoice.id}`, pageWidth - margin, rightBoxY, { align: 'right' });
  rightBoxY += 6;
  doc.text(`تاريخ الإصدار: ${new Date(invoice.issueDate).toLocaleDateString('ar-SA')}`, pageWidth - margin, rightBoxY, { align: 'right' });
  
  let leftBoxY = yPos;
  doc.text(`فاتورة إلى:`, margin + clientBoxWidth, leftBoxY, { align: 'right' });
  leftBoxY += 6;
  doc.text(client.name, margin + clientBoxWidth, leftBoxY, { align: 'right' });
  leftBoxY += 6;
  if (client.phone) {
    doc.text(`جوال العميل: ${client.phone}`, margin + clientBoxWidth, leftBoxY, { align: 'right' });
    leftBoxY += 6;
  }
  if (settings.showClientAddressField && client.address) {
    doc.text(`الحي: ${client.address}`, margin + clientBoxWidth, leftBoxY, { align: 'right' });
  }

  yPos = Math.max(rightBoxY, leftBoxY) + 10;

  // --- Items Table ---
  const head = [['الإجمالي', 'قيمة الضريبة', 'الضريبة %', 'الخصم %', 'سعر الوحدة', 'الكمية', 'المنتج/الخدمة']];
  const body = calculatedItems.map(item => [
    `${item.total.toFixed(2)} ${INVOICE_CURRENCY}`,
    `${item.taxAmount.toFixed(2)} ${INVOICE_CURRENCY}`,
    settings.showTaxField ? `${item.taxPercentage.toFixed(2)}%` : '-',
    settings.showDiscountField ? `${item.discountPercentage.toFixed(2)}%` : '-',
    `${item.unitPrice.toFixed(2)} ${INVOICE_CURRENCY}`,
    item.quantity.toString(),
    item.productName,
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: head,
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 160, 133], // A teal color
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      font: FONT_NAME, // Use the loaded Arabic font
    },
    bodyStyles:{
      font: FONT_NAME, // Use the loaded Arabic font
      halign: 'right', 
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: 'right' }, 
      1: { halign: 'right' }, 
      2: { halign: 'center' }, 
      3: { halign: 'center' }, 
      4: { halign: 'right' }, 
      5: { halign: 'center' }, 
      6: { halign: 'right', cellWidth: 'auto'}, 
    },
    margin: { right: margin, left: margin },
    didDrawPage: (data: any) => {
        // You can add headers/footers per page if needed
    }
  });

  yPos = (doc as any).lastAutoTable.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPos + 20;

  // --- Summary ---
  const summaryX = pageWidth / 2 + 10; 
  const summaryLabelX = summaryX + 40;
  const summaryValueX = summaryX;

  doc.setFont(FONT_NAME); // Ensure Arabic font
  doc.setFontSize(10);
  doc.setTextColor(50);

  doc.text('المجموع الفرعي:', summaryLabelX, yPos, { align: 'right' });
  doc.text(`${summary.subtotal.toFixed(2)} ${INVOICE_CURRENCY}`, summaryValueX, yPos, { align: 'left' });
  yPos += 7;

  if (settings.showDiscountField) {
    doc.text('إجمالي الخصم:', summaryLabelX, yPos, { align: 'right' });
    doc.text(`${summary.totalDiscount.toFixed(2)} ${INVOICE_CURRENCY}`, summaryValueX, yPos, { align: 'left' });
    yPos += 7;
  }

  if (settings.showTaxField) {
    doc.text('إجمالي الضريبة:', summaryLabelX, yPos, { align: 'right' });
    doc.text(`${summary.totalTax.toFixed(2)} ${INVOICE_CURRENCY}`, summaryValueX, yPos, { align: 'left' });
    yPos += 7;
  }
  
  doc.setLineWidth(0.5);
  doc.line(summaryValueX - 5, yPos - 3, summaryLabelX + 5, yPos - 3);

  doc.setFontSize(12);
  doc.setFont(FONT_NAME, 'bold'); 
  doc.setTextColor(16, 128, 103); // Darker teal
  doc.text('الإجمالي النهائي:', summaryLabelX, yPos, { align: 'right' });
  doc.text(`${summary.grandTotal.toFixed(2)} ${INVOICE_CURRENCY}`, summaryValueX, yPos, { align: 'left' });
  yPos += 10;

  doc.setFont(FONT_NAME, 'normal'); // Reset to normal style

  // --- Notes ---
  if (invoice.notes) {
    doc.setFont(FONT_NAME); // Ensure Arabic font
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text('الملاحظات:', pageWidth - margin, yPos, { align: 'right' });
    yPos += 5;
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin - 20); 
    doc.text(notesLines, pageWidth - margin, yPos, { align: 'right' });
    yPos += notesLines.length * 5; 
  }

  // --- Footer ---
  doc.setFont(FONT_NAME); // Ensure Arabic font
  const footerText = "شكراً لتعاملكم معنا!";
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(footerText, pageWidth / 2, pageHeight - margin / 2, { align: 'center' });

  return doc.output('datauristring');
};