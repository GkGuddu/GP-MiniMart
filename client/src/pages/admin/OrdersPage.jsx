import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search, Filter } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders', error);
            toast.error('Failed to load orders');
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/orders/${id}/status`, { status: newStatus });
            setOrders(orders.map(order =>
                order._id === id ? { ...order, status: newStatus, isDelivered: newStatus === 'Delivered' } : order
            ));
            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update status', error);
            toast.error('Failed to update status');
        }
    };

    const handlePaymentStatusUpdate = async (id, isPaid) => {
        try {
            await api.put(`/orders/${id}/payment-status`, { isPaid: isPaid === 'true' });
            setOrders(orders.map(order =>
                order._id === id ? { ...order, isPaid: isPaid === 'true', paidAt: isPaid === 'true' ? new Date() : null } : order
            ));
            toast.success(`Payment status updated to ${isPaid === 'true' ? 'Successful' : 'Pending'}`);
        } catch (error) {
            console.error('Failed to update payment status', error);
            toast.error('Failed to update payment status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.includes(searchTerm) || order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search order ID or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:text-indigo-600 focus:border-indigo-500"
                    />
                </div>

                <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
                    {['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === status
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="text-center py-10">Loading orders...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                                #{order._id.substring(0, 8)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.user?.name || 'Guest'}
                                                <div className="text-xs text-gray-500">{order.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                ₹{order.totalPrice}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="font-medium text-gray-800">{order.paymentMethod}</div>
                                                <div className="mt-1">
                                                    <select
                                                        value={order.isPaid ? 'true' : 'false'}
                                                        onChange={(e) => handlePaymentStatusUpdate(order._id, e.target.value)}
                                                        className={`text-xs font-semibold rounded px-2 py-0.5 border cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${order.isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                                                    >
                                                        <option value="false">Pending</option>
                                                        <option value="true">Successful</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    className={`text-xs font-semibold rounded-full px-3 py-1 border-0 ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 cursor-pointer ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                            order.status === 'Processed' || order.status === 'Processing' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                                                                order.status === 'Cancelled' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                                                                    'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                                        }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/admin/orders/${order._id}`}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                                >
                                                    <Eye size={16} className="mr-1" /> Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
