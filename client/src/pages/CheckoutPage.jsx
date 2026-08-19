import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, CheckCircle, ArrowRight, ArrowLeft, QrCode, Smartphone, X, ShieldCheck } from 'lucide-react';

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
        fullName: user?.name || '',
        mobileNumber: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');
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

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                return resolve(true);
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async (orderData, finalPrice) => {
        setLoading(true);
        try {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error('Razorpay SDK failed to load');
                setLoading(false);
                return;
            }

            const { data: createdOrder } = await api.post('/orders', orderData);

            const { data: rzpOrder } = await api.post('/payment/razorpay/create-order', {
                amount: finalPrice,
                orderId: createdOrder._id,
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || rzpOrder.key,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: 'SwiftCart',
                description: 'Order Payment',
                order_id: rzpOrder.id,
                handler: async (response) => {
                    try {
                        const { data: verifyData } = await api.post('/payment/razorpay/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: createdOrder._id,
                        });

                        clearCart();
                        toast.success('🎉 Razorpay Payment & Order Successful!');
                        navigate('/order-success', { state: { order: verifyData.order || createdOrder } });
                    } catch (verifyErr) {
                        toast.error(verifyErr.response?.data?.message || 'Payment verification failed');
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast.error('Payment cancelled by user');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: address.fullName,
                    email: user?.email || '',
                    contact: address.mobileNumber,
                },
                theme: {
                    color: '#4f46e5',
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', (response) => {
                toast.error(response.error.description || 'Payment Failed');
                setLoading(false);
            });
            paymentObject.open();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Razorpay initialization failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = () => {
        const finalPrice = promoApplied ? totalPrice - discountDetails.amount : totalPrice;
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

        if (paymentMethod === 'Razorpay Online') {
            handleRazorpayPayment(orderData, finalPrice);
        } else {
            submitOrder(orderData, finalPrice);
        }
    };

    const submitOrder = async (orderData, finalPrice) => {
        setLoading(true);
        try {
            const { data } = await api.post('/orders', orderData);

            if (paymentMethod === 'UPI / QR Code') {
                try {
                    await api.put(`/orders/${data._id}/pay`, { paymentMethod: 'UPI / QR Code' });
                } catch (payError) {
                    console.error('Failed to mark as paid', payError);
                }
            }

            clearCart();
            toast.success('🎉 Payment & Order Successful!');
            navigate('/order-success', { state: { order: data } });
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
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Your cart is empty</h2>
                <button onClick={() => navigate('/shop')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md">
                    Go Shopping
                </button>
            </div>
        );
    }

    const finalAmount = promoApplied ? totalPrice - discountDetails.amount : totalPrice;
    const upiId = '7367850872@paytm';
    const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiId)}%26pn=SwiftCart%26am=${finalAmount}%26cu=INR`;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="flex justify-center items-center mb-12">
                <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${step >= 1 ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-300'}`}>1</div>
                    <span className="ml-2.5 font-semibold text-sm hidden sm:block">Address</span>
                </div>
                <div className={`w-16 h-1 mx-4 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${step >= 2 ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-300'}`}>2</div>
                    <span className="ml-2.5 font-semibold text-sm hidden sm:block">Payment</span>
                </div>
                <div className={`w-16 h-1 mx-4 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${step >= 3 ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-300'}`}>3</div>
                    <span className="ml-2.5 font-semibold text-sm hidden sm:block">Confirm</span>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100">
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center">
                            <MapPin className="mr-2.5 text-indigo-600" /> Shipping Address
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={address.fullName}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                                <input
                                    type="text"
                                    name="mobileNumber"
                                    value={address.mobileNumber}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                                    placeholder="+91 9876543210"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={address.address}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                                    placeholder="House No., Street Name, Area"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={address.city}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                                    placeholder="City"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Postal Code</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={address.postalCode}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                                    placeholder="PIN Code"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => address.address && address.city && address.postalCode && address.fullName && address.mobileNumber ? setStep(2) : toast.error('Please fill all fields')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center shadow-lg shadow-indigo-500/25"
                            >
                                Continue to Payment <ArrowRight className="ml-2" size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center">
                            <CreditCard className="mr-2.5 text-indigo-600" /> Select Payment Method
                        </h2>
                        
                        <div className="space-y-4">
                            <label className={`flex items-start p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'UPI / QR Code' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="UPI / QR Code"
                                    checked={paymentMethod === 'UPI / QR Code'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="h-5 w-5 text-indigo-600 mt-1 focus:ring-indigo-500"
                                />
                                <div className="ml-3.5 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-lg text-gray-900 flex items-center">
                                            <QrCode size={20} className="mr-2 text-indigo-600" /> Instant UPI / QR Code Payment
                                        </span>
                                        <span className="bg-indigo-100 text-indigo-700 text-xs font-black uppercase px-2.5 py-1 rounded-full">Fastest</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Scan QR code using Google Pay, PhonePe, Paytm, or BHIM UPI apps.</p>
                                </div>
                            </label>

                            <label className={`flex items-start p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'Razorpay Online' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="Razorpay Online"
                                    checked={paymentMethod === 'Razorpay Online'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="h-5 w-5 text-indigo-600 mt-1 focus:ring-indigo-500"
                                />
                                <div className="ml-3.5 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-lg text-gray-900 flex items-center">
                                            <ShieldCheck size={20} className="mr-2 text-indigo-600" /> Razorpay Online Gateway
                                        </span>
                                        <span className="bg-emerald-100 text-emerald-700 text-xs font-black uppercase px-2.5 py-1 rounded-full">Cards/Netbanking/UPI</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Secure payment using Cards, NetBanking, Wallets, and UPI Gateway.</p>
                                </div>
                            </label>

                            <label className={`flex items-start p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'Cash on Delivery' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="Cash on Delivery"
                                    checked={paymentMethod === 'Cash on Delivery'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="h-5 w-5 text-indigo-600 mt-1 focus:ring-indigo-500"
                                />
                                <div className="ml-3.5 flex-1">
                                    <span className="font-bold text-lg text-gray-900">Cash on Delivery (COD)</span>
                                    <p className="text-xs text-gray-500 mt-1">Pay with cash when your groceries arrive at your doorstep.</p>
                                </div>
                            </label>
                        </div>

                        <div className="flex justify-between pt-6 border-t border-gray-100">
                            <button
                                onClick={() => setStep(1)}
                                className="text-gray-600 hover:text-gray-900 font-semibold flex items-center px-4 py-2"
                            >
                                <ArrowLeft className="mr-2" size={18} /> Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center shadow-lg shadow-indigo-500/25"
                            >
                                Review Order <ArrowRight className="ml-2" size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center">
                            <CheckCircle className="mr-2.5 text-indigo-600" /> Order Summary
                        </h2>

                        <div className="bg-gray-50/80 rounded-2xl p-6 space-y-4 border border-gray-100">
                            <div className="flex justify-between border-b border-gray-200/80 pb-4 text-sm">
                                <span className="text-gray-500 font-medium">Shipping Address:</span>
                                <span className="font-bold text-gray-900 text-right">
                                    {address.fullName} (+91 {address.mobileNumber})<br />
                                    {address.address}, {address.city} - {address.postalCode}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200/80 pb-4 text-sm">
                                <span className="text-gray-500 font-medium">Payment Mode:</span>
                                <span className="font-bold text-indigo-600">{paymentMethod}</span>
                            </div>

                            <div className="space-y-2.5 py-2">
                                {cartItems.map(item => (
                                    <div key={item._id} className="flex justify-between text-sm">
                                        <span className="text-gray-700">{item.name} <strong className="text-gray-900">x{item.qty}</strong></span>
                                        <span className="font-bold text-gray-900">₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Promo Code (e.g. WELCOME10)"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        disabled={promoApplied}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-semibold uppercase"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={promoApplied || !promoCode}
                                        className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${promoApplied ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-900 text-white hover:bg-black'}`}
                                    >
                                        {promoApplied ? 'Applied' : 'Apply'}
                                    </button>
                                </div>
                                {promoApplied && (
                                    <div className="flex justify-between text-emerald-600 mb-2 text-sm font-semibold">
                                        <span>Discount ({discountDetails.percent}%)</span>
                                        <span>-₹{discountDetails.amount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t border-gray-200">
                                    <span>Total Payable</span>
                                    <span className="text-indigo-600">₹{finalAmount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="text-gray-600 hover:text-gray-900 font-semibold flex items-center px-4 py-2"
                            >
                                <ArrowLeft className="mr-2" size={18} /> Back
                            </button>

                            {paymentMethod === 'UPI / QR Code' ? (
                                <button
                                    onClick={() => setShowQRModal(true)}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center shadow-lg shadow-indigo-500/25"
                                >
                                    <QrCode size={18} className="mr-2" /> Pay via UPI QR Code <ArrowRight className="ml-2" size={18} />
                                </button>
                            ) : paymentMethod === 'Razorpay Online' ? (
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                                >
                                    {loading ? 'Initializing Razorpay...' : 'Pay with Razorpay'} <ArrowRight className="ml-2" size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                                >
                                    {loading ? 'Confirming Order...' : 'Confirm Order'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showQRModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <div className="flex items-center space-x-2">
                                <QrCode className="text-indigo-600" size={22} />
                                <h3 className="text-lg font-black text-gray-900">Scan & Pay via UPI</h3>
                            </div>
                            <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="bg-white p-4 rounded-2xl border-2 border-indigo-500 shadow-md mb-4 relative group">
                                <img
                                    src={upiQrUrl}
                                    alt="UPI Payment QR Code"
                                    className="w-52 h-52 object-contain"
                                />
                            </div>

                            <p className="text-sm font-semibold text-gray-700 mb-1">
                                Scan with GPay, PhonePe, Paytm, or BHIM
                            </p>
                            <p className="text-xs text-gray-400 mb-4">
                                UPI ID: <strong className="text-gray-800">{upiId}</strong>
                            </p>

                            <div className="w-full bg-indigo-50 rounded-2xl p-4 mb-6 flex justify-between items-center border border-indigo-100">
                                <span className="text-sm text-indigo-900 font-semibold">Total Amount</span>
                                <span className="text-2xl font-black text-indigo-700">₹{finalAmount}</span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex justify-center items-center"
                            >
                                {loading ? 'Processing Order...' : 'Confirm Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;
