import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { ShoppingCart, Menu, X, User, LogOut, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const cartCount = cartItems ? cartItems.reduce((acc, item) => acc + item.qty, 0) : 0;
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100 shadow-sm py-3 text-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link to="/home" className="flex items-center space-x-3 group">
                        <img src="/logo.png" alt="Logo" className="h-10 w-auto group-hover:scale-105 transition-transform" />
                        <span className="text-2xl font-black tracking-tight text-gray-900">
                            GP MiniMart
                        </span>
                    </Link>

                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
                        <input
                            type="text"
                            placeholder="Search groceries, staples & daily needs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder-gray-400"
                        />
                        <Search size={18} className="absolute left-3.5 top-2.5 text-gray-400" />
                    </form>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/home" className="font-semibold text-sm text-gray-700 hover:text-indigo-600 transition-colors">
                            Home
                        </Link>
                        <Link to="/shop" className="font-semibold text-sm text-gray-700 hover:text-indigo-600 transition-colors">
                            Shop
                        </Link>
                        <Link to="/blog" className="font-semibold text-sm text-gray-700 hover:text-indigo-600 transition-colors">
                            Blog
                        </Link>
                        <Link to="/contact" className="font-semibold text-sm text-gray-700 hover:text-indigo-600 transition-colors">
                            Contact
                        </Link>

                        <Link to="/cart" className="relative p-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-all">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 focus:outline-none py-1.5 px-3 rounded-full bg-gray-100 border border-gray-200 text-gray-800 hover:bg-gray-200/80 transition-all">
                                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span className="font-bold text-sm max-w-[100px] truncate">{user.name}</span>
                                    <ChevronDown size={14} />
                                </button>

                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-xs font-bold text-gray-500">Signed in as</p>
                                        <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                    </div>

                                    {user.role === 'admin' && (
                                        <Link to="/admin/dashboard" className="flex items-center px-4 py-2.5 text-sm text-indigo-600 font-bold hover:bg-indigo-50 transition-colors">
                                            <User size={16} className="mr-2" /> Admin Dashboard
                                        </Link>
                                    )}

                                    <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                                        <User size={16} className="mr-2 text-gray-400" /> My Profile
                                    </Link>

                                    <Link to="/myorders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                                        <ShoppingCart size={16} className="mr-2 text-gray-400" /> My Orders
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium border-t border-gray-100 mt-1"
                                    >
                                        <LogOut size={16} className="mr-2" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-full text-sm shadow-md transition-all"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    <div className="flex md:hidden items-center space-x-4">
                        <Link to="/cart" className="relative p-2 rounded-full text-gray-700">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-200 overflow-hidden shadow-xl"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-3">
                            <form onSubmit={handleSearch} className="mb-4 relative">
                                <input
                                    type="text"
                                    placeholder="Search groceries..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-900 focus:outline-none"
                                />
                                <Search size={18} className="absolute left-3.5 top-2.5 text-gray-400" />
                            </form>

                            <Link
                                to="/home"
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 rounded-xl font-bold text-gray-800 hover:bg-gray-100"
                            >
                                Home
                            </Link>
                            <Link
                                to="/shop"
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 rounded-xl font-bold text-gray-800 hover:bg-gray-100"
                            >
                                Shop
                            </Link>
                            <Link
                                to="/blog"
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 rounded-xl font-bold text-gray-800 hover:bg-gray-100"
                            >
                                Blog
                            </Link>
                            <Link
                                to="/contact"
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 rounded-xl font-bold text-gray-800 hover:bg-gray-100"
                            >
                                Contact
                            </Link>

                            {user ? (
                                <div className="pt-4 border-t border-gray-100 space-y-2">
                                    <div className="px-3 py-2 bg-gray-50 rounded-xl mb-2">
                                        <p className="font-bold text-sm text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    {user.role === 'admin' && (
                                        <Link
                                            to="/admin/dashboard"
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-2 rounded-xl font-bold text-indigo-600 bg-indigo-50"
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-xl font-semibold text-gray-700 hover:bg-gray-100"
                                    >
                                        My Profile
                                    </Link>
                                    <Link
                                        to="/myorders"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-xl font-semibold text-gray-700 hover:bg-gray-100"
                                    >
                                        My Orders
                                    </Link>
                                    <button
                                        onClick={() => { handleLogout(); setIsOpen(false); }}
                                        className="w-full text-left px-3 py-2 rounded-xl font-semibold text-red-600 hover:bg-red-50"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-4 border-t border-gray-100">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full text-center bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-md"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
