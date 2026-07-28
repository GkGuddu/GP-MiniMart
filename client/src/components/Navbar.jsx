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
            if (window.scrollY > 10) {
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
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass-dark shadow-lg py-2 border-b border-white/5' : 'bg-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center bg-transparent">
                    {/* Added bg-transparent to fix potential stacking context issues */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center group mr-8">
                            <img src="/logo.png" alt="GP MiniMart" className="h-10 w-auto mr-2 hover:scale-105 transition-transform drop-shadow-md" />
                            <span className="text-2xl font-black bg-gradient-to-r from-primary to-indigo-400 text-transparent bg-clip-text group-hover:opacity-80 transition-opacity tracking-tight">
                                GP MiniMart
                            </span>
                        </Link>

                        {/* Desktop Search Bar */}
                        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative w-80 group">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-2.5 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/20 text-sm placeholder-gray-500 text-gray-800 transition-all shadow-inner"
                            />
                            <Search className="absolute left-3.5 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                        </form>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/home" className={`font-medium transition-colors ${scrolled ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-primary'}`}>Home</Link>
                        <Link to="/shop" className={`font-medium transition-colors ${scrolled ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-primary'}`}>Shop</Link>
                        <Link to="/blog" className={`font-medium transition-colors ${scrolled ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-primary'}`}>Blog</Link>
                        <Link to="/contact" className={`font-medium transition-colors ${scrolled ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-primary'}`}>Contact</Link>

                        {user && user.role === 'admin' && (
                            <Link to="/admin/dashboard" className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm">
                                🛡️ Admin
                            </Link>
                        )}

                        <div className="border-r border-gray-300 h-6 mx-2"></div>

                        <Link to="/cart" className={`relative group p-2 rounded-full transition-all ${scrolled ? 'text-gray-200 hover:bg-white/10 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-primary'}`}>
                            <ShoppingCart size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative group">
                                <button className={`flex items-center space-x-2 focus:outline-none py-1 px-3 rounded-full border ${scrolled ? 'bg-white/10 border-white/20 text-gray-200 hover:text-white' : 'bg-white/50 border-gray-200 text-gray-700 hover:text-primary'}`}>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{user.name.split(' ')[0]}</span>
                                    <ChevronDown size={16} />
                                </button>
                                <div className="absolute right-0 w-56 mt-2 origin-top-right bg-white/90 backdrop-blur-md border border-gray-100 divide-y divide-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                                    <div className="py-2">
                                        <div className="px-4 py-3">
                                            <p className="text-sm">Signed in as</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide border-t pt-1">Role: <span className={user.role === 'admin' ? 'text-red-600 font-bold' : 'text-blue-600 font-bold'}>{user.role}</span></p>
                                        </div>
                                        <div className="h-px bg-gray-100 my-1" />
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">Profile</Link>
                                        <Link to="/myorders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">My Orders</Link>
                                        <div className="h-px bg-gray-100 my-1" />
                                        <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center rounded-b-xl">
                                            <LogOut size={16} className="mr-2" /> Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex space-x-4">
                                <Link to="/login" className="text-gray-700 hover:text-primary font-medium px-4 py-2">Login</Link>
                                <Link to="/signup" className="bg-primary text-white px-5 py-2 rounded-full hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            <Link to="/home" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium hover:bg-gray-50">Home</Link>
                            <Link to="/shop" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium hover:bg-gray-50">Shop</Link>
                            <Link to="/blog" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium hover:bg-gray-50">Blog</Link>
                            <Link to="/contact" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium hover:bg-gray-50">Contact</Link>
                            {user && user.role === 'admin' && (
                                <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium hover:bg-gray-50">Dashboard</Link>
                            )}
                            <Link to="/cart" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium hover:bg-gray-50">Cart</Link>
                            {user ? (
                                <>
                                    <div className="border-t border-gray-100 my-2"></div>
                                    <div className="px-3 py-2 text-sm text-gray-500">Signed in as {user.name}</div>
                                    <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium hover:bg-gray-50">Profile</Link>
                                    <Link to="/myorders" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium hover:bg-gray-50">My Orders</Link>
                                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left block text-red-600 hover:bg-red-50 px-3 py-2 rounded-md font-medium">Logout</button>
                                </>
                            ) : (
                                <>
                                    <div className="border-t border-gray-100 my-2"></div>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium hover:bg-gray-50">Login</Link>
                                    <Link to="/signup" onClick={() => setIsOpen(false)} className="block text-primary font-bold px-3 py-2 rounded-md hover:bg-gray-50">Sign Up</Link>
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
