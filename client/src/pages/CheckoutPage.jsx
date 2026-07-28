import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: 'India',
        fullName: '',
        mobileNumber: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [showQRModal, setShowQRModal] = useState(false);

    const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [discountDetails, setDiscountDetails] = useState({ code: '', amount: 0, percent: 0 });

    const handleApplyPromo = async () => {
        if (!promoCode) return;

        try {
            const { data } = await api.post('/coupons/verify', { code: promoCode });
            setPromoApplied(true);
            setDiscountDetails({
                code: data.code,
                percent: data.discount,
                amount: Math.round(totalPrice * (data.discount / 100))
            });
            toast.success(data.message);
        } catch (error) {
            setPromoApplied(false);
            setDiscountDetails({ code: '', amount: 0, percent: 0 });
            toast.error(error.response?.data?.message || 'Invalid Coupon');
        }
    };

    const handlePlaceOrder = () => {
        const finalPrice = promoApplied ? totalPrice - discountDetails.amount : totalPrice;
        submitOrder(finalPrice);
    };

    const submitOrder = async (finalPrice) => {
        setLoading(true);
        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item._id,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    qty: item.qty
                })),
                shippingAddress: address,
                paymentMethod,
                totalPrice: finalPrice
            };

            const { data } = await api.post('/orders', orderData);

            // If Paid via QR, mark as paid immediately
            if (paymentMethod === 'UPI / QR Code') {
                try {
                    await api.put(`/orders/${data._id}/pay`, { paymentMethod: 'UPI / QR Code' });
                } catch (payError) {
                    console.error('Failed to mark as paid', payError);
                    // Still success for placing order, admin can verify
                }
            }

            clearCart();
            toast.success('Order placed successfully!');
            navigate('/myorders');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <button onClick={() => navigate('/shop')} className="text-primary hover:underline">Go Shopping</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Steps Indicator */}
            <div className="flex justify-center items-center mb-12">
                <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${step >= 1 ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>1</div>
                    <span className="ml-2 font-medium hidden sm:block">Address</span>
                </div>
                <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${step >= 2 ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>2</div>
                    <span className="ml-2 font-medium hidden sm:block">Payment</span>
                </div>
                <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${step >= 3 ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>3</div>
                    <span className="ml-2 font-medium hidden sm:block">Confirm</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Step 1: Address */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center"><MapPin className="mr-2" /> Shipping Address</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={address.fullName}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input
                                    type="text"
                                    name="mobileNumber"
                                    value={address.mobileNumber}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="+91 9876543210"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={address.address}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="123 MiniMart St"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={address.city}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="Mumbai"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={address.postalCode}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="400001"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => address.address && address.city && address.postalCode && address.fullName && address.mobileNumber ? setStep(2) : toast.error('Please fill all fields')}
                                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-200"
                            >
                                Continue to Payment <ArrowRight className="ml-2" size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center"><CreditCard className="mr-2" /> Payment Method</h2>
                        <div className="space-y-4">
                            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="Cash on Delivery"
                                    checked={paymentMethod === 'Cash on Delivery'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="h-5 w-5 text-primary focus:ring-primary"
                                />
                                <span className="ml-3 font-medium text-lg">Cash on Delivery</span>
                            </label>
                            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'UPI / QR Code' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="UPI / QR Code"
                                    checked={paymentMethod === 'UPI / QR Code'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="h-5 w-5 text-primary focus:ring-primary"
                                />
                                <span className="ml-3 font-medium text-lg">UPI / QR Payment</span>
                            </label>
                        </div>
                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="text-gray-600 hover:text-gray-900 font-medium flex items-center"
                            >
                                <ArrowLeft className="mr-2" size={18} /> Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-200"
                            >
                                Review Order <ArrowRight className="ml-2" size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center"><CheckCircle className="mr-2" /> Review Order</h2>

                        <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                            <div className="flex justify-between border-b border-gray-200 pb-4">
                                <span className="text-gray-600">Shipping to:</span>
                                <span className="font-medium text-right">
                                    {address.fullName} (+91 {address.mobileNumber})<br />
                                    {address.address}, {address.city} - {address.postalCode}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-4">
                                <span className="text-gray-600">Payment:</span>
                                <span className="font-medium">{paymentMethod}</span>
                            </div>
                            <div className="space-y-2">
                                {cartItems.map(item => (
                                    <div key={item._id} className="flex justify-between text-sm">
                                        <span>{item.name} x {item.qty}</span>
                                        <span className="font-medium">₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Promo Code (Try WELCOME10)"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        disabled={promoApplied}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary uppercase"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={promoApplied || !promoCode}
                                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${promoApplied ? 'bg-gray-100 text-gray-500' : 'bg-gray-800 text-white hover:bg-black'}`}
                                    >
                                        {promoApplied ? 'Applied' : 'Apply'}
                                    </button>
                                </div>
                                {promoApplied && (
                                    <div className="flex justify-between text-green-600 mb-2 font-medium">
                                        <span>Discount ({discountDetails.percent}%)</span>
                                        <span>-₹{discountDetails.amount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Amount</span>
                                    <span className="text-primary">₹{promoApplied ? totalPrice - discountDetails.amount : totalPrice}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="text-gray-600 hover:text-gray-900 font-medium flex items-center"
                            >
                                <ArrowLeft className="mr-2" size={18} /> Back
                            </button>

                            {paymentMethod === 'UPI / QR Code' ? (
                                <button
                                    onClick={() => setShowQRModal(true)}
                                    disabled={loading}
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-200"
                                >
                                    Pay via QR Code <ArrowRight className="ml-2" size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processing...' : 'Place Order'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* QR Code Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Scan to Pay</h2>
                            <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <CheckCircle className="rotate-45" size={24} />
                            </button>
                        </div>
                        <div className="p-8 flex flex-col items-center">
                            <div className="bg-white p-4 rounded-xl border-2 border-primary mb-6 shadow-sm">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=shop@upi&pn=MiniMart&am=${promoApplied ? totalPrice - discountDetails.amount : totalPrice}`}
                                    alt="Payment QR Code"
                                    className="w-48 h-48"
                                />
                            </div>
                            <p className="text-center text-gray-600 mb-6">
                                Scal the QR code with any UPI app to pay <span className="font-bold text-gray-900">₹{promoApplied ? totalPrice - discountDetails.amount : totalPrice}</span>
                            </p>
                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex justify-center items-center"
                            >
                                {loading ? 'Confirming...' : 'I Have Paid'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;
