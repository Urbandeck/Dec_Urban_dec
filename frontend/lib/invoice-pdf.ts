import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (order: any) => {
  const pdf = new jsPDF();
  
  const invoiceNumber = (order.orderId || order.id || '').slice(0, 16).toUpperCase();
  const invoiceDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Company header
  pdf.setFontSize(24);
  pdf.setTextColor(37, 99, 235); // Blue color
  pdf.text('Urbandec', 20, 20);
  
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128); // Gray color
  pdf.text('Digital Frames Shop', 20, 26);
  pdf.text('urbandec.in@gmail.com', 20, 31);
  pdf.text('1-800-FRAMES', 20, 36);

  // Invoice title and details
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text('INVOICE', 140, 20);
  
  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Invoice #: ${invoiceNumber}`, 140, 28);
  pdf.text(`Invoice Date: ${invoiceDate}`, 140, 33);
  pdf.text(`Order Date: ${orderDate}`, 140, 38);
  if (order.paymentId) {
    pdf.text(`Payment ID: ${order.paymentId}`, 140, 43);
  }

  // Payment status
  const statusY = order.paymentId ? 48 : 43;
  pdf.setFillColor(16, 185, 129); // Green color
  pdf.rect(140, statusY, 25, 6, 'F');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text(order.status === 'PAID' ? 'PAID' : order.status, 142, statusY + 4);

  // Bill To and Ship To sections
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Bill To:', 20, 60);
  
  pdf.setFontSize(9);
  pdf.setTextColor(75, 85, 99);
  const customerName = order.customerName || order.customerDetails?.fullName || '';
  pdf.setFont(undefined, 'bold');
  pdf.text(customerName, 20, 66);
  pdf.setFont(undefined, 'normal');
  pdf.text(order.customerEmail || order.customerDetails?.email || '', 20, 71);
  pdf.text(order.customerPhone || order.customerDetails?.phone || '', 20, 76);

  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Ship To:', 110, 60);
  
  pdf.setFontSize(9);
  pdf.setTextColor(75, 85, 99);
  pdf.setFont(undefined, 'bold');
  pdf.text(customerName, 110, 66);
  pdf.setFont(undefined, 'normal');
  
  const address = order.shippingAddress || order.customerDetails?.address || '';
  const cityStatePin = `${order.city || order.customerDetails?.city || ''}, ${order.state || order.customerDetails?.state || ''} - ${order.pincode || order.customerDetails?.pincode || ''}`;
  const phone = `Phone: ${order.customerPhone || order.customerDetails?.phone || ''}`;
  
  // Handle long addresses by wrapping text
  const maxWidth = 80;
  const addressLines = pdf.splitTextToSize(address, maxWidth);
  let yPos = 71;
  addressLines.forEach((line: string) => {
    pdf.text(line, 110, yPos);
    yPos += 5;
  });
  pdf.text(cityStatePin, 110, yPos);
  pdf.text(phone, 110, yPos + 5);

  // Order Items Table
  const tableStartY = 95;
  const tableData = (order.items || []).map((item: any) => [
    item.productName || item.name || '',
    (item.productAttributes || item.attributes) || '-',
    item.quantity.toString(),
    `₹${(item.price || 0).toFixed(2)}`,
    `₹${((item.total || (item.price * item.quantity)) || 0).toFixed(2)}`
  ]);

  autoTable(pdf, {
    startY: tableStartY,
    head: [['Product', 'Details', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [249, 250, 251],
      textColor: [55, 65, 81],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [75, 85, 99]
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    }
  });

  // Get the final Y position after the table
  const finalY = (pdf as any).lastAutoTable.finalY + 10;
  
  // Summary box background
  pdf.setFillColor(249, 250, 251);
  pdf.rect(110, finalY - 5, 85, 45, 'F');
  
  pdf.setFontSize(10);
  pdf.setTextColor(75, 85, 99);
  pdf.text('Subtotal:', 115, finalY);
  pdf.text(`₹${(order.subtotal || 0).toFixed(2)}`, 185, finalY, { align: 'right' });
  
  pdf.text('Tax (18% GST):', 115, finalY + 8);
  pdf.text(`₹${(order.tax || 0).toFixed(2)}`, 185, finalY + 8, { align: 'right' });
  
  pdf.text('Shipping:', 115, finalY + 16);
  pdf.setTextColor(16, 185, 129);
  pdf.text('FREE', 185, finalY + 16, { align: 'right' });
  
  // Total
  pdf.setDrawColor(229, 231, 235);
  pdf.line(115, finalY + 22, 190, finalY + 22);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont(undefined, 'bold');
  pdf.text('Total Amount:', 115, finalY + 32);
  pdf.text(`₹${(order.totalAmount || 0).toFixed(2)}`, 185, finalY + 32, { align: 'right' });

  // Footer
  const pageHeight = pdf.internal.pageSize.height;
  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.setFont(undefined, 'normal');
  
  pdf.text('Thank you for your business!', 105, pageHeight - 30, { align: 'center' });
  pdf.setFontSize(8);
  pdf.text('This is a computer-generated invoice. No signature is required.', 105, pageHeight - 25, { align: 'center' });
  pdf.text('For any queries, please contact us at urbandec.in@gmail.com', 105, pageHeight - 20, { align: 'center' });

  return pdf;
};

export const downloadInvoicePDF = (order: any) => {
  const pdf = generateInvoicePDF(order);
  const invoiceNumber = (order.orderId || order.id || '').slice(0, 16).toUpperCase();
  pdf.save(`invoice-${invoiceNumber}.pdf`);
};