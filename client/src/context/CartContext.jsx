import { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, qty = 1) => {
        const existItem = cartItems.find((x) => x._id === product._id);
        if (existItem) {
            setCartItems(
                cartItems.map((x) =>
                    x._id === product._id ? { ...x, qty: x.qty + qty } : x
                )
            );
            toast.success('Cart updated');
        } else {
            setCartItems([...cartItems, { ...product, qty }]);
            toast.success(`${product.name} added to cart!`);
        }
    };

    const removeFromCart = (id) => {
        setCartItems(cartItems.filter((x) => x._id !== id));
        toast.error('Item removed from cart');
    };

    const decreaseFromCart = (product) => {
        const existItem = cartItems.find((x) => x._id === product._id);
        if (existItem.qty === 1) {
            setCartItems(cartItems.filter((x) => x._id !== product._id));
            toast.error(`${product.name} removed from cart`);
        } else {
            setCartItems(
                cartItems.map((x) =>
                    x._id === product._id ? { ...x, qty: x.qty - 1 } : x
                )
            );
            toast.error('Quantity updated');
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, decreaseFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
