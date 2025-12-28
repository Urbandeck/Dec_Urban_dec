export const generateInvoiceHTML = (order: any) => {
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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice #${(order.orderId || order.id || '').slice(0, 16).toUpperCase()}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          color: #111827;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563EB;
        }
        .invoice-details {
          text-align: right;
        }
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .invoice-info {
          color: #6b7280;
          font-size: 14px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #111827;
        }
        .address-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 30px;
        }
        .address-block {
          font-size: 14px;
          line-height: 1.6;
          color: #4b5563;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th {
          background-color: #f9fafb;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
        }
        .items-table th:last-child,
        .items-table td:last-child {
          text-align: right;
        }
        .summary {
          display: flex;
          justify-content: flex-end;
          margin-top: 30px;
        }
        .summary-content {
          width: 300px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .summary-row.total {
          font-weight: bold;
          font-size: 16px;
          border-top: 2px solid #e5e7eb;
          margin-top: 10px;
          padding-top: 15px;
        }
        .payment-status {
          display: inline-block;
          padding: 4px 12px;
          background-color: #10b981;
          color: white;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 10px;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">Urbandec</div>
          <div style="margin-top: 10px; color: #6b7280; font-size: 14px;">
            Digital Frames Shop<br>
            urbandec.in@gmail.com<br>
            1-800-FRAMES
          </div>
        </div>
        <div class="invoice-details">
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-info">
            <div style="margin-bottom: 5px;">
              <strong>Invoice #:</strong> ${(order.orderId || order.id || '').slice(0, 16).toUpperCase()}
            </div>
            <div style="margin-bottom: 5px;">
              <strong>Invoice Date:</strong> ${invoiceDate}
            </div>
            <div style="margin-bottom: 5px;">
              <strong>Order Date:</strong> ${orderDate}
            </div>
            ${order.paymentId ? `<div><strong>Payment ID:</strong> ${order.paymentId}</div>` : ''}
          </div>
          <span class="payment-status">${order.status === 'PAID' ? 'PAID' : order.status}</span>
        </div>
      </div>

      <div class="address-grid">
        <div>
          <div class="section-title">Bill To</div>
          <div class="address-block">
            <strong>${order.customerName || order.customerDetails?.fullName}</strong><br>
            ${order.customerEmail || order.customerDetails?.email}<br>
            ${order.customerPhone || order.customerDetails?.phone}
          </div>
        </div>
        <div>
          <div class="section-title">Ship To</div>
          <div class="address-block">
            <strong>${order.customerName || order.customerDetails?.fullName}</strong><br>
            ${order.shippingAddress || order.customerDetails?.address}<br>
            ${order.city || order.customerDetails?.city}, ${order.state || order.customerDetails?.state} - ${order.pincode || order.customerDetails?.pincode}<br>
            Phone: ${order.customerPhone || order.customerDetails?.phone}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Order Items</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Details</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map((item: any) => `
              <tr>
                <td><strong>${item.productName || item.name}</strong></td>
                <td>${(item.productAttributes || item.attributes) || '-'}</td>
                <td>${item.quantity}</td>
                <td>₹${(item.price || 0).toFixed(2)}</td>
                <td>₹${((item.total || (item.price * item.quantity)) || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="summary">
        <div class="summary-content">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>₹${(order.subtotal || 0).toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Tax (18% GST):</span>
            <span>₹${(order.tax || 0).toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping:</span>
            <span style="color: #10b981;">FREE</span>
          </div>
          <div class="summary-row total">
            <span>Total Amount:</span>
            <span>₹${(order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <p><strong>Thank you for your business!</strong></p>
        <p>This is a computer-generated invoice. No signature is required.</p>
        <p>For any queries, please contact us at urbandec.in@gmail.com</p>
      </div>
    </body>
    </html>
  `;

  return html;
};

export const downloadInvoice = (order: any) => {
  const html = generateInvoiceHTML(order);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${(order.orderId || order.id || '').slice(0, 16).toUpperCase()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};