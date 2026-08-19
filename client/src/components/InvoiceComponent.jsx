import React from 'react';
import { X, Printer } from 'lucide-react';

const InvoiceComponent = ({ order, onClose }) => {
    if (!order) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide printable-invoice">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center no-print">
                    <h2 className="text-xl font-bold">Invoice</h2>
                    <div className="flex space-x-2">
                        <button onClick={handlePrint} className="flex items-center text-gray-600 hover:text-gray-900 border px-3 py-1 rounded">
                            <Printer size={18} className="mr-2" /> Print
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div id="printable-area" className="p-8">
                    {/* Header */}
                    <div className="flex justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-indigo-600">SwiftCart</h1>
                            <p className="text-gray-500">Shop Smarter, Faster</p>
                            <p className="text-gray-500 text-sm mt-1">123, Market Road, City, India</p>
                            <p className="text-gray-500 text-sm">GSTIN: 29ABCDE1234F1Z5</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-semibold mb-2">INVOICE</h3>
                            <p className="text-gray-600">Invoice #: <span className="font-mono font-bold text-gray-900">{order.invoiceNumber || 'N/A'}</span></p>
                            <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p className="text-gray-600">Status: <span className="uppercase font-bold">{order.paymentMethod === 'COD' && !order.isPaid ? 'Unpaid' : 'Paid'}</span></p>
                        </div>
                    </div>

                    {/* Customer & Shipping Info */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-8 flex flex-col md:flex-row justify-between">
                        <div className="mb-4 md:mb-0">
                            <h4 className="font-bold text-gray-700 mb-2">Bill To:</h4>
                            <p className="font-semibold">{order.user?.name || 'Customer'}</p>
                            <p className="text-gray-600">{order.user?.email}</p>
                        </div>
                        <div className="text-right md:text-right text-left">
                            <h4 className="font-bold text-gray-700 mb-2">Ship To:</h4>
                            <p className="text-gray-600">{order.shippingAddress?.address}</p>
                            <p className="text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                            <p className="text-gray-600">{order.shippingAddress?.country}</p>
                        </div>
                    </div>

                    {/* Order Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 font-semibold text-gray-700">Item Description</th>
                                <th className="text-center py-3 font-semibold text-gray-700">Qty</th>
                                <th className="text-right py-3 font-semibold text-gray-700">Price</th>
                                <th className="text-right py-3 font-semibold text-gray-700">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-4 text-gray-800">{item.name}</td>
                                    <td className="py-4 text-center text-gray-600">{item.qty}</td>
                                    <td className="py-4 text-right text-gray-600">₹{item.price}</td>
                                    <td className="py-4 text-right font-medium text-gray-900">₹{item.price * item.qty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₹{order.totalPrice}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Tax (Incl.)</span>
                                <span className="font-medium">₹{(order.totalPrice * 0.05).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-4">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-lg font-bold text-indigo-600">₹{order.totalPrice}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center text-gray-500 text-sm">
                        <p>Thank you for shopping with SwiftCart!</p>
                        <p>For any queries, contact support@swiftcart.com</p>
                    </div>
                </div>
            </div>
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-invoice, .printable-invoice * {
                        visibility: visible;
                    }
                    .printable-invoice {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default InvoiceComponent;
