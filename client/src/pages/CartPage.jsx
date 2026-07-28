import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

const CartPage = () => {
    const { cartItems, removeFromCart, addToCart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    const checkoutHandler = () => {
        if (!user) {
            navigate('/login?redirect=checkout');
        } else {
            navigate('/checkout');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Your cart is empty</h2>
                    <Link to="/shop" className="text-primary hover:text-indigo-700 font-medium inline-flex items-center">
                        <ArrowLeft size={16} className="mr-2" /> Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {cartItems.map(item => (
                                <li key={item._id} className="p-6 flex items-center">
                                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md border border-gray-100" />
                                    <div className="ml-6 flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="text-lg font-medium text-gray-900"><Link to={`/product/${item._id}`}>{item.name}</Link></h3>
                                            <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">{item.unit}</p>
                                        <div className="mt-4 flex justify-between items-center">
                                            <div className="flex items-center border rounded-md">
                                                <button
                                                    className="p-2 hover:bg-gray-50 text-gray-600"
                                                    onClick={() => addToCart(item, -1)}
                                                    disabled={item.qty <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="px-4 font-medium">{item.qty}</span>
                                                <button
                                                    className="p-2 hover:bg-gray-50 text-gray-600"
                                                    onClick={() => addToCart(item, 1)}
                                                    disabled={item.stock <= item.qty}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium"
                                            >
                                                <Trash2 size={16} className="mr-1" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Checkout Summary */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                            <div className="flow-root">
                                <dl className="-my-4 divide-y divide-gray-200">
                                    <div className="py-4 flex items-center justify-between">
                                        <dt className="text-sm text-gray-600">Subtotal</dt>
                                        <dd className="text-sm font-medium text-gray-900">₹{totalPrice}</dd>
                                    </div>
                                    <div className="py-4 flex items-center justify-between">
                                        <dt className="text-sm text-gray-600">Shipping</dt>
                                        <dd className="text-sm font-medium text-gray-900">Free</dd>
                                    </div>
                                    <div className="py-4 flex items-center justify-between border-t border-gray-200">
                                        <dt className="text-base font-bold text-gray-900">Total</dt>
                                        <dd className="text-base font-bold text-gray-900">₹{totalPrice}</dd>
                                    </div>
                                </dl>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={checkoutHandler}
                                    className="w-full bg-primary border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200"
                                >
                                    Checkout
                                </button>
                                <div className="mt-4 text-center text-xs text-gray-500">
                                    By placing this order you agree to our Terms.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
