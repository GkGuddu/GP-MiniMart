import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Package, Truck, CheckCircle, Clock, FileText, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import InvoiceComponent from '../components/InvoiceComponent';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); // For Invoice Modal

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/myorders');
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
        if (orders.length > 0) {
            const socket = io(SOCKET_URL);

            orders.forEach(order => {
                socket.emit('joinOrderRoom', order._id);
            });

            socket.on('orderStatusUpdated', (updatedOrder) => {
                setOrders(prevOrders => 
                    prevOrders.map(o => o._id === updatedOrder._id ? { ...o, status: updatedOrder.status, isDelivered: updatedOrder.isDelivered, deliveredAt: updatedOrder.deliveredAt } : o)
                );
                toast.success(`Order #${updatedOrder._id.substring(0, 8)} status updated to ${updatedOrder.status}!`, {
                    icon: '📦',
                    duration: 5000
                });
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [orders.length]);

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await api.put(`/orders/${orderId}/cancel`);
                toast.success('Order cancelled successfully');
                fetchOrders(); // Refresh status
            } catch (error) {
                console.error('Error cancelling order', error);
                toast.error(error.response?.data?.message || 'Failed to cancel order');
            }
        }
    };

    if (loading) return <div className="text-center py-10">Loading Orders...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
            {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-100">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                    <p className="text-gray-500 mt-2">Start shopping to see your orders here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100 transition-all hover:shadow-md">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order ID</p>
                                    <p className="font-mono text-gray-900 font-medium">#{order._id.substring(0, 10)}...</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="font-bold text-primary">₹{order.totalPrice}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                        order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        <FileText size={16} className="mr-1" /> Invoice
                                    </button>
                                    {order.status === 'Pending' && (
                                        <button
                                            onClick={() => handleCancelOrder(order._id)}
                                            className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium ml-2"
                                        >
                                            <Ban size={16} className="mr-1" /> Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Visual Status Tracker */}
                            {order.status !== 'Cancelled' && (
                                <div className="px-8 py-8 border-b border-gray-50">
                                    <div className="relative">
                                        {/* Progress Bar Background */}
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full -z-0"></div>

                                        {/* Dynamic Progress Bar */}
                                        <div
                                            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 rounded-full -z-0 transition-all duration-1000 ease-out"
                                            style={{
                                                width: order.status === 'Delivered' ? '100%' :
                                                    order.status === 'Shipped' ? '66%' :
                                                        order.status === 'Processing' ? '33%' : '0%'
                                            }}
                                        ></div>

                                        <div className="flex justify-between w-full relative z-10">
                                            {[
                                                { status: 'Pending', icon: <Clock size={16} /> },
                                                { status: 'Processing', icon: <Package size={16} /> },
                                                { status: 'Shipped', icon: <Truck size={16} /> },
                                                { status: 'Delivered', icon: <CheckCircle size={16} /> }
                                            ].map((step, idx) => {
                                                const stepIdx = ['Pending', 'Processing', 'Shipped', 'Delivered'].indexOf(order.status);
                                                const currentIdx = ['Pending', 'Processing', 'Shipped', 'Delivered'].findIndex(s => s === step.status);
                                                const isCompleted = stepIdx >= currentIdx;

                                                return (
                                                    <div key={idx} className="flex flex-col items-center">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${isCompleted ? 'bg-green-500 border-green-100 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-300'
                                                            }`}>
                                                            {step.icon}
                                                        </div>
                                                        <span className={`text-xs mt-3 font-semibold tracking-wide ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                            {step.status}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="px-6 py-4 bg-gray-50/30">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Items Ordered</h4>
                                <ul className="space-y-3">
                                    {order.orderItems.map((item, index) => (
                                        <li key={index} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center text-gray-700">
                                                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center mr-3 text-xs font-bold text-gray-500">
                                                    {item.qty}x
                                                </div>
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            <span className="text-gray-500">₹{item.price * item.qty}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Invoice Modal Component */}
            {selectedOrder && (
                <InvoiceComponent order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    );
};

export default MyOrdersPage;
