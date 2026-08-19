import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, Clock, Loader, Tag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useEffect, useState, useRef } from 'react';
import { getProducts, getCategories } from '../services/api';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [featuredCategories, setFeaturedCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const mainRef = useRef(null);
    const heroRef = useRef(null);
    const categoryGridRef = useRef(null);
    const offersRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategories()
                ]);

                setFeaturedProducts(productsData.slice(0, 4));
                setFeaturedCategories(categoriesData);
            } catch (error) {
                toast.error("Failed to load home page data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!mainRef.current) return;

        const ctx = gsap.context(() => {
            if (heroRef.current) {
                const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

                tl.fromTo(
                    '.gsap-hero-badge',
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0 }
                )
                .fromTo(
                    '.gsap-hero-title',
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0 },
                    '-=0.6'
                )
                .fromTo(
                    '.gsap-hero-sub',
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0 },
                    '-=0.6'
                )
                .fromTo(
                    '.gsap-hero-cta',
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, stagger: 0.15 },
                    '-=0.4'
                )
                .fromTo(
                    '.gsap-hero-stats',
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, stagger: 0.15, duration: 0.6 },
                    '-=0.4'
                );
            }
        }, mainRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (!loading && categoryGridRef.current && featuredCategories.length > 0) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    '.gsap-category-card',
                    { opacity: 0, y: 35, scale: 0.92 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.5,
                        stagger: 0.05,
                        ease: 'back.out(1.4)'
                    }
                );
            }, categoryGridRef);
            return () => ctx.revert();
        }
    }, [loading, featuredCategories]);

    const offers = [
        {
            id: 1,
            title: "Super Saver Atta & Dal Combo",
            subtitle: "Flat 20% OFF on Monthly Ration Package",
            badge: "Best Seller",
            discount: "20% OFF",
            color: "bg-slate-900 text-white",
            link: "/shop?category=Atta%20%26%20Flours",
            code: "RATION20"
        },
        {
            id: 2,
            title: "Fresh Morning Dairy & Eggs",
            subtitle: "Get Milk, Paneer & Eggs Delivered By 7 AM",
            badge: "Daily Fresh",
            discount: "Instant 15%",
            color: "bg-indigo-950 text-white",
            link: "/shop?category=Dairy%20%26%20Eggs",
            code: "FRESH15"
        }
    ];

    return (
        <div ref={mainRef} className="space-y-16">
            <section ref={heroRef} className="relative rounded-3xl bg-slate-900 text-white p-8 md:p-16 overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-2xl space-y-6">
                    <span className="gsap-hero-badge inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold tracking-wider mb-5 shadow-sm relative z-10">
                        ⚡ Instant 15-Min Local Kirana Delivery
                    </span>
                    <h1 className="gsap-hero-title text-4xl md:text-6xl font-black leading-tight tracking-tight text-white">
                        Your Trusted Local <br />
                        <span className="text-indigo-400">Kirana Store</span> Online.
                    </h1>
                    <p className="gsap-hero-sub text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
                        Get fresh groceries, daily staples, milk, fruits & household essentials delivered right to your doorstep in minutes.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link to="/shop" className="gsap-hero-cta group bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-bold text-lg shadow-lg transition-all flex items-center transform hover:-translate-y-0.5">
                            Order Now <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </Link>
                        <Link to="/signup" className="gsap-hero-cta px-8 py-3.5 rounded-full font-bold text-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white shadow-sm">
                            Create Account
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-10 border-t border-white/10 mt-12 max-w-xl">
                    <div className="gsap-hero-stats">
                        <p className="text-2xl md:text-3xl font-extrabold text-white">100%</p>
                        <p className="text-xs text-slate-400 font-medium">Fresh Quality</p>
                    </div>
                    <div className="gsap-hero-stats">
                        <p className="text-2xl md:text-3xl font-extrabold text-white">15 Min</p>
                        <p className="text-xs text-slate-400 font-medium">Fast Delivery</p>
                    </div>
                    <div className="gsap-hero-stats">
                        <p className="text-2xl md:text-3xl font-extrabold text-white">5000+</p>
                        <p className="text-xs text-slate-400 font-medium">Items Stocked</p>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-4">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Express Delivery</h3>
                        <p className="text-xs text-slate-500 font-medium">Delivered to your doorstep in 15 mins</p>
                    </div>
                </div>

                <div className="flex items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mr-4">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">100% Genuine Products</h3>
                        <p className="text-xs text-slate-500 font-medium">Directly sourced from verified brands</p>
                    </div>
                </div>

                <div className="flex items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mr-4">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">7 AM - 10 PM Service</h3>
                        <p className="text-xs text-slate-500 font-medium">Open every day for your grocery needs</p>
                    </div>
                </div>
            </section>

            <section ref={categoryGridRef} className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-wider uppercase mb-2">
                            Explore Essentials
                        </span>
                        <h2 className="text-3xl font-extrabold text-slate-900">Shop By Category</h2>
                    </div>
                    <Link to="/shop" className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center">
                        View All <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader className="animate-spin text-indigo-600" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {featuredCategories.map((category) => (
                            <Link
                                key={category._id || category.name}
                                to={`/shop?category=${encodeURIComponent(category.name)}`}
                                className="gsap-category-card group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center h-40"
                            >
                                <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    {category.image ? (
                                        <img src={category.image} alt={category.name} className="w-12 h-12 object-contain" />
                                    ) : (
                                        <span className="text-3xl">📦</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm truncate w-full group-hover:text-indigo-600 transition-colors">
                                    {category.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold tracking-wider uppercase mb-2">
                            Handpicked Deals
                        </span>
                        <h2 className="text-3xl font-extrabold text-slate-900">Featured Groceries</h2>
                    </div>
                    <Link to="/shop" className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center">
                        Explore Shop <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader className="animate-spin text-indigo-600" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            <section ref={offersRef} className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Tag className="text-indigo-600" size={24} />
                    <h2 className="text-3xl font-extrabold text-slate-900">Special Grocery Offers</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {offers.map((offer) => (
                        <motion.div
                            key={offer.id}
                            whileHover={{ y: -4 }}
                            className={`${offer.color} rounded-3xl p-8 shadow-md relative overflow-hidden flex flex-col justify-between h-64`}
                        >
                            <div className="space-y-3 relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider mb-3">
                                    {offer.badge}
                                </span>
                                <h3 className="text-2xl font-black leading-snug">{offer.title}</h3>
                                <p className="text-sm text-slate-300 font-medium">{offer.subtitle}</p>
                            </div>

                            <div className="pt-4 flex justify-between items-center relative z-10 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Use Coupon Code</p>
                                    <p className="text-lg font-black text-amber-400 font-mono">{offer.code}</p>
                                </div>
                                <Link to={offer.link} className="px-6 py-2.5 bg-white text-slate-900 rounded-full font-bold text-sm shadow-md hover:bg-slate-100 transition-all flex items-center">
                                    Claim Offer <ArrowRight size={16} className="ml-1.5" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="bg-emerald-50 rounded-3xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-12 border border-emerald-100 shadow-sm relative overflow-hidden">
                <div className="flex-1 space-y-6 relative z-10">
                    <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold tracking-wide uppercase">
                        📝 Fastest Way To Order
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                        Have a handwritten list? <br />
                        <span className="text-emerald-700">Order directly on WhatsApp!</span>
                    </h2>
                    <p className="text-slate-600 font-medium text-base">
                        Simply snap a picture of your grocery paper list or type it in WhatsApp. We will pack it and deliver it to your door!
                    </p>
                    <a
                        href="https://wa.me/917367850872?text=Hi%20GP%20MiniMart,%20I%20want%20to%20place%20an%20order"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-full text-lg shadow-md transition-all transform hover:scale-105"
                    >
                        Send List on WhatsApp <ArrowRight className="ml-2" size={20} />
                    </a>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
