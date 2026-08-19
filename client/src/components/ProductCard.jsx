import { memo, useContext, useCallback } from 'react';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import LazyImage from './LazyImage';
import toast from 'react-hot-toast';

const ProductCard = memo(({ product }) => {
    const navigate = useNavigate();
    const { addToCart, decreaseFromCart, cartItems } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    const cartItem = cartItems?.find((item) => item._id === product._id);

    const handleAddToCart = useCallback((e) => {
        e.stopPropagation();
        if (!user) {
            toast.error("Please login to shop");
            navigate('/login');
            return;
        }
        addToCart(product);
    }, [user, navigate, addToCart, product]);

    const handleDecrease = useCallback((e) => {
        e.stopPropagation();
        decreaseFromCart(product);
    }, [decreaseFromCart, product]);

    const handleCardClick = useCallback(() => {
        navigate(`/product/${product._id}`);
    }, [navigate, product._id]);

    const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;

    return (
        <div
            onClick={handleCardClick}
            className="group relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 flex flex-col justify-between h-82.5"
        >
            <div className="relative h-40 w-full bg-slate-50 flex items-center justify-center p-3">
                {product.image ? (
                    <LazyImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag size={32} />
                    </div>
                )}

                {product.unit && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100 z-10">
                        {product.unit}
                    </div>
                )}

                {product.isFeatured && (
                    <div className="absolute top-2 left-2 bg-linear-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm tracking-wider z-10">
                        FEATURED
                    </div>
                )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-md uppercase tracking-wider truncate max-w-[70%]">
                            {categoryName || 'General'}
                        </span>
                        <div className="flex text-amber-400 text-[11px]">
                            {'★'.repeat(Math.round(product.rating || 4))}
                        </div>
                    </div>

                    <h3 className="font-bold text-slate-900 truncate text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                        {product.name}
                    </h3>
                    {product.brand && (
                        <p className="text-xs text-slate-400 truncate font-medium mt-0.5">
                            {product.brand}
                        </p>
                    )}
                </div>

                <div className="flex items-end justify-between mt-3 pt-2 border-t border-slate-100">
                    <div className="flex flex-col">
                        {product.mrp && product.mrp > product.price && (
                            <span className="text-[10px] text-slate-400 line-through font-medium">
                                ₹{product.mrp}
                            </span>
                        )}
                        <span className="text-base font-black text-slate-900">
                            ₹{product.price}
                        </span>
                    </div>

                    {cartItem ? (
                        <div className="flex items-center bg-slate-100 rounded-xl h-8 p-0.5 border border-slate-200" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                onClick={handleDecrease}
                                className="w-6 h-full flex items-center justify-center text-slate-700 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                            >
                                <Minus size={12} />
                            </button>
                            <span className="font-bold text-xs w-6 text-center text-slate-900">{cartItem.qty}</span>
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="w-6 h-full flex items-center justify-center text-slate-700 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className="h-8 px-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white flex items-center justify-center gap-1 transition-all duration-200 font-bold text-xs shadow-sm hover:shadow-indigo-500/20 active:scale-95"
                        >
                            <Plus size={13} /> Add
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.product._id === nextProps.product._id &&
        prevProps.product.price === nextProps.product.price &&
        prevProps.product.stock === nextProps.product.stock &&
        prevProps.product.name === nextProps.product.name
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
