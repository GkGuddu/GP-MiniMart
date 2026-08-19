import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, Package, Truck, CreditCard, Calendar, User, MapPin, FileText } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { generateInvoicePDF } from '../../utils/generateInvoicePDF';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching order', error);
                toast.error('Failed to load order details');
                navigate('/admin/orders');
            }
        };
        fetchOrder();
    }, [id, navigate]);

    useEffect(() => {
        const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
        const socket = io(SOCKET_URL);

        socket.emit('joinOrderRoom', id);

        socket.on('orderStatusUpdated', (updatedOrder) => {
            if (updatedOrder._id === id) {
                setOrder(updatedOrder);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            const { data } = await api.put(`/orders/${id}/status`, { status: newStatus });
            setOrder(data);
            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update status', error);
            toast.error('Failed to update status');
        }
    };

    const handlePaymentStatusUpdate = async (isPaid) => {
        try {
            const { data } = await api.put(`/orders/${id}/payment-status`, { isPaid: isPaid === 'true' });
            setOrder(data);
            toast.success(`Payment status updated to ${isPaid === 'true' ? 'Successful' : 'Pending'}`);
        } catch (error) {
            console.error('Failed to update payment status', error);
            toast.error('Failed to update payment status');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link to="/admin/orders" className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-600">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                        <p className="text-sm text-gray-500">ID: #{order._id}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => generateInvoicePDF(order)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center transition-colors"
                    >
                        <FileText size={16} className="mr-1.5" /> Download Invoice PDF
                    </button>
                    <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 pl-3 pr-10 border"
                    >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped / Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Order Items & Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Package className="mr-2" size={20} /> Order Items
                            </h2>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {order.orderItems.map((item, index) => (
                                <li key={index} className="p-6 flex items-center">
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover object-center"
                                        />
                                    </div>
                                    <div className="ml-4 flex-1 flex flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <h3>{item.name}</h3>
                                                <p className="ml-4">₹{item.price * item.qty}</p>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">Qty: {item.qty}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="bg-gray-50 px-6 py-6 border-t border-gray-100">
                            <div className="flow-root">
                                <dl className="-my-4 text-sm divide-y divide-gray-200">
                                    <div className="py-4 flex items-center justify-between">
                                        <dt className="text-gray-600">Subtotal</dt>
                                        <dd className="font-medium text-gray-900">₹{order.totalPrice}</dd>
                                    </div>
                                    <div className="py-4 flex items-center justify-between">
                                        <dt className="text-gray-600">Shipping</dt>
                                        <dd className="font-medium text-gray-900">Free</dd>
                                    </div>
                                    <div className="py-4 flex items-center justify-between">
                                        <dt className="text-base font-bold text-gray-900">Total</dt>
                                        <dd className="text-base font-bold text-indigo-600">₹{order.totalPrice}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Payment Details */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <User className="mr-2" size={20} /> Customer Details
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Name</p>
                                <p className="mt-1 text-sm text-gray-900">{order.user?.name || 'Guest'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="mt-1 text-sm text-gray-900">{order.user?.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <MapPin className="mr-2" size={20} /> Shipping Address
                            </h2>
                        </div>
                        <div className="p-6">
                            <address className="text-sm text-gray-600 not-italic leading-relaxed">
                                {order.shippingAddress.address}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                                {order.shippingAddress.country}
                            </address>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <CreditCard className="mr-2" size={20} /> Payment Details
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Method</p>
                                <p className="mt-1 text-sm text-gray-900">{order.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                                <select
                                    value={order.isPaid ? 'true' : 'false'}
                                    onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
                                    className={`text-xs font-semibold rounded px-2.5 py-1 border cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${order.isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                                >
                                    <option value="false">Pending</option>
                                    <option value="true">Successful</option>
                                </select>
                            </div>
                            {order.isPaid && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Paid At</p>
                                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                                        <Calendar size={14} className="mr-1 text-gray-400" />
                                        {new Date(order.paidAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
