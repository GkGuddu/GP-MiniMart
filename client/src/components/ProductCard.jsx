import { Plus, ShoppingBag, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, decreaseFromCart, cartItems } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    // Find if item is in cart
    const cartItem = cartItems.find((item) => item._id === product._id);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!user) {
            toast.error("Please login to shop");
            navigate('/login');
            return;
        }
        addToCart(product);
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate(`/product/${product._id}`)}
            className="group relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-2"
        >
            <div className="relative h-40 w-full bg-gradient-to-br from-gray-50 to-white overflow-hidden flex items-center justify-center p-4">
                {product.image ? (
                    <motion.img
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.4 }}
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain drop-shadow-lg z-10"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={32} />
                    </div>
                )}

                <div className="absolute top-2 right-2 bg-white/70 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold text-gray-700 shadow-sm border border-white/50 z-20">
                    {product.unit}
                </div>

                {/* New/Sale Badge Mockup */}
                {Math.random() > 0.7 && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-lg shadow-amber-500/30 tracking-wider z-20 border border-white/20">
                        NEW
                    </div>
                )}

                {/* Decorative blob */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500" />
            </div>

            <div className="p-4 relative glass bg-white/40">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50/50 backdrop-blur-sm border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider">{product.category}</span>
                    <div className="flex text-amber-400 text-[10px] shadow-sm">
                        {'★'.repeat(4)}<span className="text-gray-300">★</span>
                    </div>
                </div>

                <h3 className="font-bold text-slate-800 mb-1 truncate text-base leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-xs text-slate-500 mb-3 truncate font-medium">{product.brand}</p>

                <div className="flex items-end justify-between mt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-medium mb-0">Price</span>
                        <span className="text-lg font-black text-slate-900">₹{product.price}</span>
                    </div>

                    {cartItem ? (
                        <div className="flex items-center bg-gray-100/80 backdrop-blur-sm rounded-xl h-9 p-1 shadow-inner ring-1 ring-gray-200">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => { e.stopPropagation(); decreaseFromCart(product); }}
                                className="w-7 h-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm"
                            >
                                <Minus size={12} />
                            </motion.button>
                            <span className="font-bold text-xs w-6 text-center text-gray-800">{cartItem.qty}</span>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleAddToCart}
                                className="w-7 h-full flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-white rounded-lg transition-all shadow-sm"
                            >
                                <Plus size={12} />
                            </motion.button>
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddToCart}
                            className="h-9 px-4 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-center gap-1.5 hover:from-primary hover:to-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-bold text-xs border border-white/10"
                        >
                            <Plus size={14} /> Add
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div >
    );
};

export default ProductCard;
