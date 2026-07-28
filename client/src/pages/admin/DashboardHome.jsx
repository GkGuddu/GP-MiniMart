import { useEffect, useState } from 'react';
import { 
    TrendingUp, ShoppingBag, Package, Users, Loader, 
    AlertTriangle, DollarSign, Award, Bell, ArrowRight 
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_COLORS = {
    'Delivered': '#10b981',   // Emerald
    'Pending': '#f59e0b',     // Amber
    'Processing': '#3b82f6',  // Blue
    'Shipped': '#8b5cf6',     // Purple
    'Cancelled': '#ef4444'     // Red
};

const STATUS_PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];

const DashboardHome = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        products: 0,
        users: 0,
        aov: 0,
        lowStock: 0,
        refunds: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [liveAlerts, setLiveAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [ordersRes, productsRes, usersRes] = await Promise.all([
                api.get('/orders'),
                api.get('/products'),
                api.get('/users')
            ]);

            const orders = ordersRes.data;
            const products = productsRes.data;
            const users = usersRes.data;

            // Calculate Metrics
            const activeOrders = orders.filter(o => o.status !== 'Cancelled');
            const totalRevenue = activeOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
            const aov = orders.length ? Math.round(totalRevenue / activeOrders.length) : 0;
            const lowStockCount = products.filter(p => p.stock < 5).length;
            const totalRefunds = orders.reduce((acc, order) => acc + (order.refundAmount || 0), 0);

            setStats({
                revenue: totalRevenue,
                orders: orders.length,
                products: products.length,
                users: users.length,
                aov,
                lowStock: lowStockCount,
                refunds: totalRefunds
            });

            // Calculate Order Status Distributions
            const statusCounts = orders.reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
            }, {});
            
            const pieData = Object.keys(statusCounts).map(status => ({
                name: status,
                value: statusCounts[status]
            }));
            setStatusData(pieData);

            // Calculate Top 5 Selling Products
            const productSales = {};
            orders.forEach(order => {
                if (order.status !== 'Cancelled') {
                    order.orderItems.forEach(item => {
                        const name = item.name;
                        if (!productSales[name]) {
                            productSales[name] = { name, qty: 0, revenue: 0, image: item.image };
                        }
                        productSales[name].qty += item.qty;
                        productSales[name].revenue += item.price * item.qty;
                    });
                }
            });

            const top5 = Object.values(productSales)
                .sort((a, b) => b.qty - a.qty)
                .slice(0, 5);
            setTopProducts(top5);

            // Calculate Chart Data (Sales Trend last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            const trendData = last7Days.map(date => {
                const dailyOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(date));
                const activeDailyOrders = dailyOrders.filter(o => o.status !== 'Cancelled');
                const dailyRevenue = activeDailyOrders.reduce((acc, o) => acc + o.totalPrice, 0);
                return {
                    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                    orders: dailyOrders.length,
                    revenue: dailyRevenue
                };
            });
            setChartData(trendData);

            // Get 5 recent orders
            setRecentOrders(orders.slice(0, 5));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data', error);
            toast.error('Failed to load dashboard data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        const SOCKET_URL = import.meta.env.VITE_API_URL 
            ? import.meta.env.VITE_API_URL.replace('/api', '') 
            : 'http://localhost:5000';
        const socket = io(SOCKET_URL);

        socket.on('newOrderPlaced', (data) => {
            const alertText = `🎉 Order #${data.orderId.substring(0, 6)} by ${data.userName} (₹${data.totalPrice})`;
            toast.success(alertText, {
                duration: 6000,
                icon: '🛒'
            });

            setLiveAlerts(prev => [
                { id: Date.now(), text: alertText, time: new Date().toLocaleTimeString() },
                ...prev.slice(0, 4)
            ]);

            fetchDashboardData();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    const statCards = [
        { label: 'Net Revenue', value: `₹${stats.revenue.toLocaleString()}`, subText: 'Excludes cancelled orders', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
        { label: 'Avg Order Value (AOV)', value: `₹${stats.aov}`, subText: 'Per active order', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
        { label: 'Total Orders', value: stats.orders, subText: 'Received all time', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        { label: 'Low Stock Alerts', value: stats.lowStock, subText: 'Items with stock < 5', icon: AlertTriangle, color: stats.lowStock > 0 ? 'text-rose-600 animate-pulse' : 'text-gray-600', bg: stats.lowStock > 0 ? 'bg-rose-50 border-rose-100' : 'bg-gray-50 border-gray-100' },
    ];

    return (
        <div className="space-y-6 animate-fade-in text-gray-900 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time performance analytics and store summary.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-xs">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-gray-600">Live Updates Connected</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div 
                        key={index} 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white p-6 rounded-2xl border flex items-center transition-all duration-300 hover:shadow-md ${stat.bg}`}
                    >
                        <div className={`p-3.5 rounded-xl bg-white mr-4 shadow-sm ${stat.color}`}>
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-extrabold text-gray-950 mt-1">{stat.value}</h3>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">{stat.subText}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Grid for main chart & notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Area Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
                            <p className="text-xs text-gray-400">Total earnings in the past 7 days</p>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Last 7 Days</span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} 
                                    contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 4, stroke: '#4f46e5', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Live Activity & Notifications */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Bell className="text-indigo-600 h-5 w-5 animate-bounce" /> Live Activity
                            </h2>
                            <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full uppercase">Realtime</span>
                        </div>
                        
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                            <AnimatePresence initial={false}>
                                {liveAlerts.length > 0 ? (
                                    liveAlerts.map(alert => (
                                        <motion.div
                                            key={alert.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-start gap-2 text-xs"
                                        >
                                            <span className="font-medium text-gray-700">{alert.text}</span>
                                            <span className="text-gray-400 font-semibold whitespace-nowrap">{alert.time}</span>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-gray-400 flex flex-col items-center justify-center gap-2">
                                        <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                                            <Bell size={20} />
                                        </div>
                                        <span className="text-xs font-semibold">No recent notifications</span>
                                        <span className="text-[10px] text-gray-400">New orders will show up here live</span>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    {stats.lowStock > 0 && (
                        <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3">
                            <div className="p-2 bg-rose-500 rounded-lg text-white">
                                <AlertTriangle size={16} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-rose-950">Action Required</h4>
                                <p className="text-[10px] text-rose-600 font-medium">{stats.lowStock} products are running low on stock.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Row for Pie Chart and Top Selling Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Selling Products */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Top Selling Products</h2>
                            <p className="text-xs text-gray-400">Highest quantity sold excluding cancellations</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {topProducts.map((prod, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-gray-50/50 transition">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-400 w-4">#{index + 1}</span>
                                    <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shadow-xs border border-gray-100 flex items-center justify-center">
                                        <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">{prod.name}</h4>
                                        <span className="text-[10px] text-gray-500 font-semibold">{prod.qty} items sold</span>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-gray-900">₹{prod.revenue.toLocaleString()}</span>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <p className="text-center py-6 text-xs text-gray-400 italic">No products sold yet</p>
                        )}
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Order Statuses</h2>
                        <p className="text-xs text-gray-400 mb-4">Breakdown of orders by current status</p>
                        <div className="h-48 flex justify-center items-center relative">
                            {statusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#cbd5e1'} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value} Orders`, 'Count']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No order status data available</p>
                            )}
                            {statusData.length > 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-gray-900">{stats.orders}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Total Orders</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {statusData.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold">
                            {statusData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-md border border-gray-100/50">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.name] || '#cbd5e1' }} />
                                    <span className="text-gray-600 truncate max-w-[80px]" title={item.name}>{item.name}</span>
                                    <span className="text-gray-900 ml-auto font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Summary of the latest customer purchases</p>
                    </div>
                    <a href="/admin/orders" className="text-indigo-600 text-xs font-bold hover:text-indigo-800 flex items-center gap-1 transition">
                        View All Orders <ArrowRight size={14} />
                    </a>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 text-xs">
                        <thead className="bg-gray-50/70">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Total Price</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {recentOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-indigo-600">
                                        #{order._id.substring(18).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        {order.user?.name || 'Guest'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                        ₹{order.totalPrice.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 font-bold rounded-md ${order.isPaid
                                            ? 'bg-green-50 text-green-700 border border-green-100'
                                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                                            }`}>
                                            {order.isPaid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 font-bold rounded-full text-[10px]" style={{
                                            backgroundColor: `${STATUS_COLORS[order.status]}15`,
                                            color: STATUS_COLORS[order.status]
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-semibold">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-400 italic">No orders found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
