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

    // Handle scroll effect
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
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
            scrolled 
                ? 'bg-white/95 backdrop-blur-md shadow-lg py-2.5 border-b border-gray-200/80 text-gray-900' 
                : 'bg-white/90 backdrop-blur-md shadow-sm py-3 border-b border-gray-100 text-gray-900'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    
                    {/* Brand Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center group mr-8">
                            <img src="/logo.png" alt="GP MiniMart" className="h-10 w-auto mr-2.5 group-hover:scale-105 transition-transform drop-shadow-sm" />
                            <span className="text-2xl font-black bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-600 text-transparent bg-clip-text tracking-tight">
                                GP MiniMart
                            </span>
                        </Link>

                        {/* Desktop Search Bar */}
                        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative w-80 group">
                            <input
                                type="text"
                                placeholder="Search products, groceries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100/90 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-2xl py-2 px-4 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                            <Search className="absolute left-3 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={17} />
                        </form>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/home" className="font-semibold text-gray-700 hover:text-indigo-600 transition-colors text-sm">
                            Home
                        </Link>
                        <Link to="/shop" className="font-semibold text-gray-700 hover:text-indigo-600 transition-colors text-sm">
                            Shop
                        </Link>
                        <Link to="/blog" className="font-semibold text-gray-700 hover:text-indigo-600 transition-colors text-sm">
                            Blog
                        </Link>
                        <Link to="/contact" className="font-semibold text-gray-700 hover:text-indigo-600 transition-colors text-sm">
                            Contact
                        </Link>

                        {user && user.role === 'admin' && (
                            <Link to="/admin/dashboard" className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm">
                                🛡️ Admin Panel
                            </Link>
                        )}

                        <div className="border-r border-gray-200 h-5 mx-1"></div>

                        {/* Cart Button */}
                        <Link to="/cart" className="relative group p-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-all">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Account Menu */}
                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 focus:outline-none py-1.5 px-3 rounded-full bg-gray-100 border border-gray-200 text-gray-800 hover:bg-gray-200/80 transition-all">
                                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-sm">{user.name.split(' ')[0]}</span>
                                    <ChevronDown size={15} className="text-gray-500" />
                                </button>

                                <div className="absolute right-0 w-56 mt-2 origin-top-right bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform scale-95 group-hover:scale-100 z-50">
                                    <div className="p-3 border-b border-gray-100">
                                        <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                                        <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                        <span className={`inline-block mt-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="py-1">
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition-colors">
                                            Profile
                                        </Link>
                                        <Link to="/myorders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition-colors">
                                            My Orders
                                        </Link>
                                    </div>
                                    <div className="p-1 border-t border-gray-100">
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center rounded-xl transition-colors">
                                            <LogOut size={16} className="mr-2" /> Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-semibold px-3 py-2 text-sm transition-colors">
                                    Login
                                </Link>
                                <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
                    >
                        <div className="px-4 pt-3 pb-6 space-y-2">
                            <form onSubmit={handleSearch} className="mb-3 relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-100 border border-gray-200 rounded-xl py-2 px-4 pl-10 text-sm text-gray-900"
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={17} />
                            </form>

                            <Link to="/home" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-indigo-600 px-3 py-2 rounded-xl font-semibold hover:bg-gray-50">Home</Link>
                            <Link to="/shop" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-indigo-600 px-3 py-2 rounded-xl font-semibold hover:bg-gray-50">Shop</Link>
                            <Link to="/blog" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-indigo-600 px-3 py-2 rounded-xl font-semibold hover:bg-gray-50">Blog</Link>
                            <Link to="/contact" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-indigo-600 px-3 py-2 rounded-xl font-semibold hover:bg-gray-50">Contact</Link>
                            {user && user.role === 'admin' && (
                                <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="block text-amber-700 font-bold px-3 py-2 rounded-xl bg-amber-50">🛡️ Admin Panel</Link>
                            )}
                            <Link to="/cart" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-indigo-600 px-3 py-2 rounded-xl font-semibold hover:bg-gray-50">
                                Cart ({cartCount})
                            </Link>

                            {user ? (
                                <>
                                    <div className="border-t border-gray-100 my-2 pt-2"></div>
                                    <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-indigo-600 px-3 py-2 rounded-xl font-semibold hover:bg-gray-50">Profile</Link>
                                    <Link to="/myorders" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-indigo-600 px-3 py-2 rounded-xl font-semibold hover:bg-gray-50">My Orders</Link>
                                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl font-semibold flex items-center">
                                        <LogOut size={16} className="mr-2" /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="border-t border-gray-100 my-2 pt-2"></div>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-indigo-600 px-3 py-2 rounded-xl font-semibold hover:bg-gray-50">Login</Link>
                                    <Link to="/signup" onClick={() => setIsOpen(false)} className="block text-indigo-600 font-bold px-3 py-2 rounded-xl bg-indigo-50">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
