import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Footer = () => {
    const [topCategories, setTopCategories] = useState([]);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories
                const { data: categoriesData } = await api.get('/categories');
                const featured = categoriesData
                    .flatMap(cat => [cat, ...(cat.subcategories || [])]) // Flatten to include subcategories if needed, or just top level
                    .filter(cat => cat.isFeatured)
                    .slice(0, 5); // Limit to 5
                setTopCategories(featured);

                // Fetch Settings
                const { data: settingsData } = await api.get('/settings');
                setSettings(settingsData);
            } catch (error) {
                console.error('Error loading footer data', error);
            }
        };

        fetchData();
    }, []);

    const handleSubscribe = () => {
        toast.success('Thanks for subscribing!');
    };

    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-slate-950 text-white pt-24 pb-12 overflow-hidden border-t border-white/5">
            {/* Background elements - Static Premium Overlay */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-sky-600/10 rounded-full blur-[80px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Newsletter Section - Now prominent */}
                <div className="glass-dark rounded-3xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="text-center md:text-left relative z-10">
                        <h3 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Join our community</h3>
                        <p className="text-gray-400 font-medium">Get fresh offers and premium recipes delivered.</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 relative z-10">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-72 transition-all hover:bg-white/10"
                        />
                        <button
                            onClick={handleSubscribe}
                            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
                        >
                            Subscribe
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 border-b border-gray-800 pb-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link to="/home" className="flex items-center space-x-2 group">
                            <span className="text-4xl">🛍️</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                {settings?.storeName || 'MiniMart'}
                            </span>
                        </Link>
                        <p className="text-gray-400 leading-relaxed">
                            {settings?.aboutUsSnippet || 'Your daily essentials, delivered in minutes. Quality you can trust, right at your doorstep.'}
                        </p>
                        <div className="flex space-x-4 pt-2">
                            {[Facebook, Twitter, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all duration-300 hover:-translate-y-1">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white inline-block relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-10 after:h-1 after:bg-primary after:rounded-full">Explore</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link to="/home" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Home</Link></li>
                            <li><Link to="/shop" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Shop All</Link></li>
                            <li><Link to="/cart" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Your Cart</Link></li>
                            <li><Link to="/myorders" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Track Order</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white inline-block relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-10 after:h-1 after:bg-secondary after:rounded-full">Top Categories</h3>
                        <ul className="space-y-4 text-gray-400">
                            {topCategories.length > 0 ? (
                                topCategories.map((cat) => (
                                    <li key={cat._id}>
                                        <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="hover:text-secondary transition-colors hover:translate-x-1 inline-block">
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li><Link to="/shop" className="hover:text-secondary transition-colors hover:translate-x-1 inline-block">Grains & Rice</Link></li>
                                    <li><Link to="/shop" className="hover:text-secondary transition-colors hover:translate-x-1 inline-block">Masala & Spices</Link></li>
                                    <li><Link to="/shop" className="hover:text-secondary transition-colors hover:translate-x-1 inline-block">Show All</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white inline-block relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-10 after:h-1 after:bg-accent after:rounded-full">Contact Us</h3>
                        <ul className="space-y-5">
                            <li className="flex items-start text-gray-400">
                                <MapPin size={22} className="mr-3 mt-1 text-primary flex-shrink-0" />
                                <span>{settings?.address || 'Indrapuri, GP MiniMart, Bhopal, India 462022'}</span>
                            </li>
                            <li className="flex items-center text-gray-400">
                                <Phone size={20} className="mr-3 text-primary flex-shrink-0" />
                                <span>{settings?.contactNumber || '+91-7367850872'}</span>
                            </li>
                            <li className="flex items-center text-gray-400">
                                <Mail size={20} className="mr-3 text-primary flex-shrink-0" />
                                <span>{settings?.email || 'support@minimart.com'}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-4">
                    <p>&copy; {currentYear} {settings?.storeName || 'MiniMart'}. Made with ❤️ in Bhopal.</p>
                    <div className="flex space-x-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
