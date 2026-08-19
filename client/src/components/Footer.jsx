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
                const { data: categoriesData } = await api.get('/categories');
                const featured = categoriesData
                    .flatMap(cat => [cat, ...(cat.subcategories || [])])
                    .filter(cat => cat.isFeatured)
                    .slice(0, 5);
                setTopCategories(featured);

                const { data: settingsData } = await api.get('/settings');
                setSettings(settingsData);
            } catch (error) {
            }
        };

        fetchData();
    }, []);

    const handleSubscribe = () => {
        toast.success('Thanks for subscribing!');
    };

    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-slate-950 text-white pt-16 pb-12 overflow-hidden border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="bg-slate-900 rounded-3xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 shadow-xl">
                    <div className="text-center md:text-left">
                        <h3 className="text-3xl font-bold mb-2 text-white">Join our community</h3>
                        <p className="text-slate-400 font-medium">Get fresh offers and daily updates delivered.</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="px-6 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full sm:w-80"
                        />
                        <button
                            onClick={handleSubscribe}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors"
                        >
                            Subscribe
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-slate-800">
                    <div className="lg:col-span-2 space-y-6">
                        <Link to="/" className="flex items-center space-x-3">
                            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                            <span className="text-2xl font-black tracking-tight text-white">GP MiniMart</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            Your trusted neighbourhood grocery store, delivering farm-fresh essentials and daily staples right to your door.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            {[Facebook, Twitter, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                                    <Icon size={18} className="text-slate-300" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white">Explore</h3>
                        <ul className="space-y-3">
                            <li><Link to="/home" className="text-slate-400 hover:text-white transition-colors text-sm">Home</Link></li>
                            <li><Link to="/shop" className="text-slate-400 hover:text-white transition-colors text-sm">Shop All</Link></li>
                            <li><Link to="/blog" className="text-slate-400 hover:text-white transition-colors text-sm">Blog & Recipes</Link></li>
                            <li><Link to="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white">Top Categories</h3>
                        <ul className="space-y-3">
                            {topCategories.map(cat => (
                                <li key={cat._id}>
                                    <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="text-slate-400 hover:text-white transition-colors text-sm">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3 text-slate-400 text-sm">
                                <MapPin size={18} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                                <span>{settings?.address || 'Main Road, GP MiniMart, Store No. 12'}</span>
                            </li>
                            <li className="flex items-center space-x-3 text-slate-400 text-sm">
                                <Phone size={18} className="text-indigo-400 flex-shrink-0" />
                                <span>{settings?.phone || '+91 73678 50872'}</span>
                            </li>
                            <li className="flex items-center space-x-3 text-slate-400 text-sm">
                                <Mail size={18} className="text-indigo-400 flex-shrink-0" />
                                <span>{settings?.supportEmail || 'support@gpminimart.com'}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
                    <p>© {currentYear} GP MiniMart. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
