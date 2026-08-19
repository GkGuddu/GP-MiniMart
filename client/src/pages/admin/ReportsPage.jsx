import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Loader, Download, Calendar, DollarSign, ShoppingBag, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);

const CATEGORY_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#f43f5e'];
const PAYMENT_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

const ReportsPage = () => {
    const [loading, setLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState('7days'); // '7days', '30days', 'all'
    const [rawData, setRawData] = useState({ orders: [], products: [], categories: [] });
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [summaryStats, setSummaryStats] = useState({ revenue: 0, orders: 0, aov: 0, itemsSold: 0 });
    const [dailyData, setDailyData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [paymentData, setPaymentData] = useState([]);

    const fetchReportData = async () => {
        try {
            const [ordersRes, productsRes, categoriesRes] = await Promise.all([
                api.get('/orders'),
                api.get('/products'),
                api.get('/categories')
            ]);
            
            setRawData({
                orders: ordersRes.data,
                products: productsRes.data,
                categories: categoriesRes.data
            });
            setLoading(false);
        } catch (error) {
            console.error("Failed to load report data", error);
            toast.error("Failed to fetch store database");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);

    useEffect(() => {
        if (loading || !rawData.orders.length) return;

        // Apply Timeframe Filter
        let cutoff;
        if (timeFrame === '7days') {
            cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 7);
        } else if (timeFrame === '30days') {
            cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 30);
        } else {
            cutoff = new Date(0); // All time (epoch)
        }

        const filtered = rawData.orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= cutoff;
        });
        setFilteredOrders(filtered);

        // Compute Summary Stats
        const activeOrders = filtered.filter(o => o.status !== 'Cancelled');
        const revenue = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0);
        const aov = activeOrders.length ? Math.round(revenue / activeOrders.length) : 0;
        const itemsSold = activeOrders.reduce((sum, o) => {
            return sum + o.orderItems.reduce((iSum, item) => iSum + item.qty, 0);
        }, 0);

        setSummaryStats({
            revenue,
            orders: filtered.length,
            aov,
            itemsSold
        });

        // Compute Daily Orders & Revenue
        const dailyGroups = {};
        filtered.forEach(order => {
            const dateStr = timeFrame === 'all'
                ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dailyGroups[dateStr]) {
                dailyGroups[dateStr] = { date: dateStr, revenue: 0, orders: 0, rawDate: new Date(order.createdAt) };
            }
            dailyGroups[dateStr].orders += 1;
            if (order.status !== 'Cancelled') {
                dailyGroups[dateStr].revenue += order.totalPrice;
            }
        });

        // Sort Daily/Monthly groups chronologically
        const dailyAggregated = Object.values(dailyGroups)
            .sort((a, b) => a.rawDate - b.rawDate)
            .map(item => ({
                date: item.date,
                orders: item.orders,
                revenue: item.revenue,
                aov: item.orders ? Math.round(item.revenue / item.orders) : 0
            }));
        setDailyData(dailyAggregated);

        // Compute Category Sales Breakdown
        const catSales = {};
        rawData.categories.forEach(c => {
            catSales[c._id] = { name: c.name, value: 0 };
        });

        filtered.forEach(order => {
            if (order.status !== 'Cancelled') {
                order.orderItems.forEach(item => {
                    const prod = rawData.products.find(p => p._id === item.product);
                    const catId = prod?.category?._id || prod?.category;
                    if (catId && catSales[catId]) {
                        catSales[catId].value += item.price * item.qty;
                    } else {
                        if (!catSales['uncategorized']) {
                            catSales['uncategorized'] = { name: 'Uncategorized', value: 0 };
                        }
                        catSales['uncategorized'].value += item.price * item.qty;
                    }
                });
            }
        });

        const categoryAggregated = Object.values(catSales)
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);
        setCategoryData(categoryAggregated);

        // Compute Payment Method distribution
        const paySales = {};
        filtered.forEach(order => {
            if (order.status !== 'Cancelled') {
                const method = order.paymentMethod || 'Cash on Delivery';
                paySales[method] = (paySales[method] || 0) + 1;
            }
        });

        const paymentAggregated = Object.keys(paySales).map(method => ({
            name: method,
            value: paySales[method]
        }));
        setPaymentData(paymentAggregated);

    }, [timeFrame, rawData, loading]);

    const loadImage = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
        });
    };

    const handlePDFExport = async () => {
        try {
            const doc = new jsPDF();
            
            // Pre-load the logo image asynchronously to guarantee compatibility with jsPDF
            const logoImg = await loadImage('/logo.png');
            
            // Header Branding Banner (Matched to GP MiniMart Purple: RGB 107, 25, 106)
            doc.setFillColor(107, 25, 106); 
            doc.rect(10, 10, 190, 36, 'F');
            
            // Mini logo circle in header
            doc.setFillColor(255, 255, 255);
            doc.circle(26, 28, 9, 'F');
            
            // Embed actual logo.png image inside the circle
            if (logoImg) {
                try {
                    doc.addImage(logoImg, 'PNG', 19, 21, 14, 14);
                } catch (err) {
                    console.error("Failed to add logo image to header:", err);
                    doc.setTextColor(107, 25, 106);
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "bold");
                    doc.text("GP", 26, 31.5, { align: "center" });
                }
            } else {
                doc.setTextColor(107, 25, 106);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("GP", 26, 31.5, { align: "center" });
            }

            // Banner Title & Subtitle shifted right
            doc.setFontSize(22);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text("GP MINIMART REPORT", 40, 27);
            
            doc.setFontSize(10.5);
            doc.setTextColor(210, 210, 255);
            doc.setFont("helvetica", "normal");
            doc.text("Store Performance & Business Intelligence Ledger", 40, 36);

            // Document Metadata Card
            doc.setFillColor(248, 250, 252);
            doc.rect(10, 52, 190, 18, 'F');
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.rect(10, 52, 190, 18);

            doc.setFontSize(9);
            doc.setTextColor(71, 85, 105);
            const timeStr = timeFrame === '7days' ? 'Last 7 Days' : timeFrame === '30days' ? 'Last 30 Days' : 'All Time';
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 16, 60);
            doc.text(`Reporting Period: ${timeStr}`, 16, 65);

            // 1. Key Metrics Section
            doc.setFontSize(13);
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.text("Key Performance Indicators (KPIs)", 12, 82);

            const summaryHeaders = [["Total Revenue", "Total Orders", "Avg Order Value (AOV)", "Total Items Sold"]];
            const summaryRows = [[
                `INR ${summaryStats.revenue.toLocaleString()}`,
                summaryStats.orders.toString(),
                `INR ${summaryStats.aov.toLocaleString()}`,
                summaryStats.itemsSold.toString()
            ]];

            doc.autoTable({
                startY: 86,
                margin: { left: 10, right: 10 },
                head: summaryHeaders,
                body: summaryRows,
                theme: 'grid',
                headStyles: { 
                    fillColor: [107, 25, 106], // Matched Purple
                    halign: 'center', 
                    valign: 'middle', 
                    fontSize: 10,
                    fontStyle: 'bold',
                    cellPadding: 3
                },
                bodyStyles: { 
                    halign: 'center', 
                    valign: 'middle', 
                    fontSize: 11, 
                    textColor: [15, 23, 42],
                    fontStyle: 'bold',
                    cellPadding: 4
                }
            });

            // 2. Daily Sales Table Section
            doc.setFontSize(13);
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.text("Sales & Transaction Ledger", 12, doc.lastAutoTable.finalY + 12);

            const dailyHeaders = [["Date / Period", "Orders Count", "Gross Revenue", "Average Ticket (AOV)"]];
            const dailyRows = dailyData.map(d => [
                d.date,
                `${d.orders} orders`,
                `INR ${d.revenue.toLocaleString()}`,
                `INR ${d.aov.toLocaleString()}`
            ]);

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 16,
                margin: { left: 10, right: 10 },
                head: dailyHeaders,
                body: dailyRows,
                theme: 'striped',
                headStyles: { 
                    fillColor: [16, 185, 129], 
                    fontSize: 10, 
                    fontStyle: 'bold',
                    cellPadding: 3
                },
                bodyStyles: {
                    fontSize: 9.5,
                    textColor: [51, 65, 85],
                    cellPadding: 3.5
                },
                alternateRowStyles: {
                    fillColor: [244, 252, 248]
                }
            });

            // 3. Category Contribution
            doc.setFontSize(13);
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.text("Sales Contribution by Category", 12, doc.lastAutoTable.finalY + 12);

            const catHeaders = [["Category Name", "Total Revenue Share"]];
            const catRows = categoryData.map(c => [
                c.name,
                `INR ${c.value.toLocaleString()}`
            ]);

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 16,
                margin: { left: 10, right: 10 },
                head: catHeaders,
                body: catRows,
                theme: 'striped',
                headStyles: { 
                    fillColor: [245, 158, 11], 
                    fontSize: 10, 
                    fontStyle: 'bold',
                    cellPadding: 3
                },
                bodyStyles: {
                    fontSize: 9.5,
                    textColor: [51, 65, 85],
                    cellPadding: 3.5
                },
                alternateRowStyles: {
                    fillColor: [255, 251, 235]
                }
            });

            // Decorate All Pages (Watermarks, Borders, Page Numbers)
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                
                // 1. Draw Subtle, Colorful, and Transparent Logo Image Watermark
                if (doc.GState) {
                    doc.saveGraphicsState();
                    const gState = new doc.GState({ opacity: 0.055 }); // Faint 5.5% opacity
                    doc.setGState(gState);
                    
                    // Draw Gp logo image centered (Page width = 210, height = 297, image = 80x80)
                    if (logoImg) {
                        try {
                            doc.addImage(logoImg, 'PNG', 65, 108, 80, 80);
                        } catch (err) {
                            console.error("Failed to add image watermark, using text fallback:", err);
                            doc.setTextColor(107, 25, 106); // Purple fallback
                            doc.setFontSize(36);
                            doc.setFont("helvetica", "bold");
                            doc.text("SWIFTCART", 105, 150, { align: "center" });
                        }
                    } else {
                        doc.setTextColor(107, 25, 106); // Purple fallback
                        doc.setFontSize(36);
                        doc.setFont("helvetica", "bold");
                        doc.text("SWIFTCART", 105, 150, { align: "center" });
                    }
                    
                    doc.restoreGraphicsState();
                } else {
                    // Light gray fallback for older versions without transparency support
                    doc.setDrawColor(242, 240, 245);
                    doc.setTextColor(242, 240, 245);
                    
                    doc.setLineWidth(1.5);
                    doc.circle(105, 150, 38, 'D');
                    doc.setLineWidth(0.5);
                    doc.circle(105, 150, 34, 'D');
                    
                    doc.setFontSize(44);
                    doc.setFont("helvetica", "bold");
                    doc.text("SC", 105, 146, { align: "center" });
                    
                    doc.setFontSize(11);
                    doc.text("SWIFTCART", 105, 158, { align: "center" });
                }
                
                // 2. Draw Page Border Frame
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.5);
                doc.rect(6, 6, 198, 285);

                // 3. Draw Footer Page Numbers and Branding
                doc.setTextColor(148, 163, 184);
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.text("Confidential Analytics Report — Internal Use Only", 12, 287);
                doc.text(`Page ${i} of ${pageCount}`, 198, 287, { align: "right" });
            }

            // Save PDF
            doc.save(`SwiftCart-Sales-Report-${timeFrame}.pdf`);
            toast.success("PDF Report downloaded successfully");
        } catch (err) {
            console.error("Failed to generate PDF", err);
            toast.error("Failed to generate PDF Report");
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    const cards = [
        { title: 'Total Revenue', value: `₹${summaryStats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
        { title: 'Orders Count', value: summaryStats.orders, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        { title: 'Average Order Value', value: `₹${summaryStats.aov.toLocaleString()}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
        { title: 'Items Sold', value: summaryStats.itemsSold, icon: ShoppingCart, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-100' },
    ];

    return (
        <div className="space-y-6 animate-fade-in text-gray-900 pb-10">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">Review sales reports, categories performance, and metrics.</p>
                </div>
                <button
                    onClick={handlePDFExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-md cursor-pointer text-xs"
                >
                    <Download size={16} /> Export PDF Report
                </button>
            </div>

            {/* Timeframe selector */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <Calendar size={16} className="text-gray-400" /> Filter Period:
                </div>
                <div className="flex gap-1.5">
                    {['7days', '30days', 'all'].map(frame => (
                        <button
                            key={frame}
                            onClick={() => setTimeFrame(frame)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                timeFrame === frame
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            {frame === '7days' ? 'Last 7 Days' : frame === '30days' ? 'Last 30 Days' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className={`bg-white p-5 rounded-2xl border flex items-center shadow-xs transition hover:shadow-md ${card.bg}`}>
                        <div className="p-3 bg-white rounded-xl shadow-xs mr-4">
                            <card.icon size={22} className={card.color} />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{card.title}</span>
                            <h3 className="text-2xl font-black text-gray-950 mt-1">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Orders Velocity</h2>
                    <p className="text-xs text-gray-400 mb-6">Quantity of orders placed over the selected timeframe</p>
                    <div className="h-72">
                        {dailyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyData} margin={{ left: -25 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                    <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '12px' }} />
                                    <Bar dataKey="orders" fill="#4f46e5" radius={[6, 6, 0, 0]}>
                                        {dailyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill="#4f46e5" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400 italic">No orders data in filter range</div>
                        )}
                    </div>
                </div>

                {/* Revenue Line Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Earnings Trend</h2>
                    <p className="text-xs text-gray-400 mb-6">Aggregate daily revenue earned during the timeframe</p>
                    <div className="h-72">
                        {dailyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyData} margin={{ left: -25 }}>
                                    <defs>
                                        <linearGradient id="colorReportRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Daily Revenue']} contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReportRevenue)" dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400 italic">No revenue data in filter range</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category / Payments Distribution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Sales Donuts */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Sales by Category</h2>
                    <p className="text-xs text-gray-400 mb-4">Total revenue breakdown per product category</p>
                    <div className="h-64 flex flex-col sm:flex-row justify-center items-center gap-6">
                        {categoryData.length > 0 ? (
                            <>
                                <div className="h-44 w-44 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                innerRadius={55}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Revenue</span>
                                        <span className="text-base font-black text-gray-900">₹{summaryStats.revenue.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex-1 w-full space-y-2 max-h-[180px] overflow-y-auto pr-1">
                                    {categoryData.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs font-semibold p-1.5 hover:bg-gray-50 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                                                <span className="text-gray-600 truncate max-w-[120px]">{item.name}</span>
                                            </div>
                                            <span className="text-gray-900">₹{item.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No category performance data</p>
                        )}
                    </div>
                </div>

                {/* Payment Methods Donuts */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Payment Method Preference</h2>
                    <p className="text-xs text-gray-400 mb-4">Volume of orders split by payment channels</p>
                    <div className="h-64 flex flex-col sm:flex-row justify-center items-center gap-6">
                        {paymentData.length > 0 ? (
                            <>
                                <div className="h-44 w-44 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={paymentData}
                                                innerRadius={55}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {paymentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} Orders`, 'Volume']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1 w-full space-y-2 max-h-[180px] overflow-y-auto pr-1">
                                    {paymentData.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs font-semibold p-1.5 hover:bg-gray-50 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[idx % PAYMENT_COLORS.length] }} />
                                                <span className="text-gray-600 truncate max-w-[120px]">{item.name}</span>
                                            </div>
                                            <span className="text-gray-900">{item.value} Orders</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No transaction data</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Performance Aggregation table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">Reporting Ledger</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Chronological summary logs of daily transactions and revenues</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 text-xs">
                        <thead className="bg-gray-50/70">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Transactions Count</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Aggregate Revenue</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Ticket Size (AOV)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {dailyData.map((d, index) => (
                                <tr key={index} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                        {d.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
                                        {d.orders} orders
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-950">
                                        ₹{d.revenue.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-indigo-600">
                                        ₹{d.aov.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {dailyData.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-400 italic">No sales logs found for this timeframe</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
