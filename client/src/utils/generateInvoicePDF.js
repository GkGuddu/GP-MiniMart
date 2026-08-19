import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export const generateInvoicePDF = (order) => {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const invoiceNo = order.invoiceNumber || `SWIFT-INV-${new Date(order.createdAt || Date.now()).getFullYear()}-${order._id.slice(-6).toUpperCase()}`;
        const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // 1. Header & Store Branding
        doc.setFillColor(79, 70, 229); // Indigo 600
        doc.rect(0, 0, 210, 26, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('SWIFTCART', 14, 16);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Your Trusted Daily Supermarket', 14, 22);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('TAX INVOICE', 196, 16, { align: 'right' });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`No: ${invoiceNo}`, 196, 22, { align: 'right' });

        // 2. Store & Invoice Info Section
        let y = 35;
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('STORE ADDRESS:', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text('SwiftCart Supermarket Main Road, Kirana Bazaar\nCity Centre, India - 400001\nSupport: support@swiftcart.com | +91 9876543210', 14, y + 5);

        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE DETAILS:', 120, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`Order ID: #${order._id.toUpperCase()}\nOrder Date: ${orderDate}\nPayment Method: ${order.paymentMethod || 'Cash on Delivery'}\nPayment Status: ${order.isPaid ? 'PAID' : 'PENDING / COD'}`, 120, y + 5);

        y += 24;

        // Divider Line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(14, y, 196, y);

        y += 6;

        // 3. Customer Billed To Section
        const addr = order.shippingAddress || {};
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('BILLED TO / SHIPPING ADDRESS:', 14, y);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const customerName = addr.fullName || order.user?.name || 'Valued Customer';
        const customerMobile = addr.mobileNumber ? `+91 ${addr.mobileNumber}` : '';
        const customerEmail = order.user?.email || '';
        const fullAddr = `${addr.address || ''}, ${addr.city || ''} - ${addr.postalCode || ''}, ${addr.country || 'India'}`;

        doc.text(`${customerName} ${customerMobile ? `(${customerMobile})` : ''}\n${customerEmail}\nAddress: ${fullAddr}`, 14, y + 5);

        y += 20;

        // 4. Products Table
        const tableBody = (order.orderItems || []).map((item, index) => [
            index + 1,
            item.name,
            item.qty,
            `Rs. ${item.price}`,
            `Rs. ${(item.price * item.qty).toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: y,
            head: [['S.No.', 'Product Description', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            theme: 'grid',
            headStyles: {
                fillColor: [79, 70, 229],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [30, 41, 59],
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 20, halign: 'center' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 35, halign: 'right' },
            },
            margin: { left: 14, right: 14 },
        });

        y = doc.lastAutoTable.finalY + 8;

        // 5. Total Calculation Box
        const subtotal = (order.orderItems || []).reduce((acc, i) => acc + i.price * i.qty, 0);
        const finalTotal = order.totalPrice || subtotal;
        const discount = subtotal > finalTotal ? subtotal - finalTotal : 0;

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(120, y, 76, 32, 3, 3, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(120, y, 76, 32, 3, 3, 'D');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', 125, y + 8);
        doc.text(`Rs. ${subtotal.toFixed(2)}`, 190, y + 8, { align: 'right' });

        if (discount > 0) {
            doc.text('Discount:', 125, y + 14);
            doc.text(`-Rs. ${discount.toFixed(2)}`, 190, y + 14, { align: 'right' });
        }

        doc.text('Delivery Fee:', 125, y + 20);
        doc.text('FREE', 190, y + 20, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(79, 70, 229);
        doc.text('Total Amount:', 125, y + 27);
        doc.text(`Rs. ${finalTotal.toFixed(2)}`, 190, y + 27, { align: 'right' });

        // 6. Payment Information Details
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT INFORMATION:', 14, y + 8);
        doc.setFont('helvetica', 'normal');

        if (order.paymentMethod === 'Razorpay Online' || order.razorpayPaymentId) {
            doc.text(`Payment Status: PAID (Online Gateway)\nRazorpay Payment ID: ${order.razorpayPaymentId || order.paymentResult?.id || 'N/A'}\nRazorpay Order ID: ${order.razorpayOrderId || 'N/A'}`, 14, y + 14);
        } else if (order.paymentMethod === 'UPI / QR Code') {
            doc.text(`Payment Status: PAID (Instant UPI QR)\nMethod: UPI QR Code`, 14, y + 14);
        } else {
            doc.text(`Payment Status: Cash on Delivery (COD)\nAmount Due: Rs. ${finalTotal.toFixed(2)}`, 14, y + 14);
        }

        // 7. Footer & Page Numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            doc.setDrawColor(226, 232, 240);
            doc.line(14, 280, 196, 280);

            doc.setTextColor(148, 163, 184);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Thank you for shopping with SwiftCart! For returns & support, contact support@swiftcart.com', 14, 286);
            doc.text(`Page ${i} of ${pageCount}`, 196, 286, { align: 'right' });
        }

        doc.save(`SwiftCart-Invoice-${invoiceNo}.pdf`);
        toast.success('Invoice PDF downloaded successfully!');
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        toast.error('Failed to generate invoice PDF');
    }
};
