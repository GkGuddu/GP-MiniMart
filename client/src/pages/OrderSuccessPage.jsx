import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Truck, ArrowRight, ShieldCheck, Heart, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';

const OrderSuccessPage = () => {
    const location = useLocation();
    const order = location.state?.order;
    const checkRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                checkRef.current,
                { scale: 0, rotate: -45, opacity: 0 },
                { scale: 1, rotate: 0, opacity: 1, duration: 0.9, ease: 'back.out(1.8)' }
            );

            gsap.fromTo(
                cardRef.current,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
            );
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-emerald-50/60 via-indigo-50/40 to-purple-50/50 relative overflow-hidden">

            <div ref={cardRef} className="w-full max-w-xl bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-8 sm:p-12 text-center border border-white/80 relative z-10">
                
                {/* Animated Checkmark Badge */}
                <div className="flex justify-center mb-6">
                    <div ref={checkRef} className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30">
                        <CheckCircle2 size={56} strokeWidth={2.5} />
                    </div>
                </div>

                {/* Main Heading */}
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3 shadow-sm">
                    🎉 Payment Successful!
                </span>

                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-3">
                    Congratulations!
                </h1>

                <p className="text-gray-600 text-sm sm:text-base font-medium max-w-md mx-auto mb-8">
                    Your payment was completed successfully! Your grocery order has been confirmed and is being packed.
                </p>

                {/* Order Highlights Box */}
                <div className="bg-gray-50/90 rounded-2xl p-5 mb-8 text-left border border-gray-100 space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-gray-200/80 pb-3">
                        <span className="text-gray-500 font-medium flex items-center">
                            <ShieldCheck size={16} className="mr-1.5 text-emerald-600" /> Payment Status
                        </span>
                        <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                            PAID & VERIFIED
                        </span>
                    </div>

                    {order && (
                        <>
                            <div className="flex justify-between items-center text-sm border-b border-gray-200/80 pb-3">
                                <span className="text-gray-500 font-medium">Order ID</span>
                                <span className="font-mono font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-gray-200/80 pb-3">
                                <span className="text-gray-500 font-medium">Amount Paid</span>
                                <span className="font-black text-indigo-600 text-base">₹{order.totalPrice}</span>
                            </div>
                        </>
                    )}

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium flex items-center">
                            <Truck size={16} className="mr-1.5 text-indigo-600" /> Estimated Delivery
                        </span>
                        <span className="font-bold text-gray-900">20 - 30 Minutes ⚡</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {order && (
                        <button
                            type="button"
                            onClick={() => generateInvoicePDF(order)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center"
                        >
                            <FileText size={18} className="mr-2" /> Download Invoice PDF
                        </button>
                    )}

                    <Link
                        to="/myorders"
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center group"
                    >
                        <ShoppingBag size={18} className="mr-2" /> Track My Order <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        to="/shop"
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center"
                    >
                        Continue Shopping
                    </Link>
                </div>

                <p className="text-xs text-gray-400 mt-6 flex items-center justify-center">
                    Thank you for choosing SwiftCart <Heart size={12} className="ml-1 text-red-500 fill-red-500" />
                </p>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
