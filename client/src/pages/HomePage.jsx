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
                console.error("Error fetching data", error);
                toast.error("Failed to load home page data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // GSAP Animations Effect
    useEffect(() => {
        if (!mainRef.current) return;

        const ctx = gsap.context(() => {
            // Hero Timeline Animation
            if (heroRef.current) {
                const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

                tl.fromTo(
                    '.gsap-hero-badge',
                    { opacity: 0, y: -20, scale: 0.9 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.6 }
                )
                .fromTo(
                    '.gsap-hero-title',
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.8 },
                    '-=0.3'
                )
                .fromTo(
                    '.gsap-hero-text',
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    '-=0.5'
                )
                .fromTo(
                    '.gsap-hero-cta',
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, stagger: 0.15, duration: 0.6 },
                    '-=0.4'
                )
                .fromTo(
                    '.gsap-hero-stats',
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, stagger: 0.15, duration: 0.6 },
                    '-=0.4'
                );
            }

            // Floating animation for floating graphics (if element exists)
            const floatElements = mainRef.current.querySelectorAll('.gsap-float');
            if (floatElements.length > 0) {
                gsap.to(floatElements, {
                    y: -12,
                    duration: 2.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut'
                });
            }
        }, mainRef);

        return () => ctx.revert();
    }, []);

    // GSAP Category Cards Stagger Effect when loaded
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

    return (
        <div ref={mainRef} className="space-y-16 pb-12">
            {/* Hero Section with GSAP Animations */}
            <section ref={heroRef} className="relative h-[85vh] md:h-[90vh] rounded-3xl overflow-hidden shadow-2xl mb-12">
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center transform scale-105"
                    style={{ backgroundImage: "url('/supermarket_hero_bg.png')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-900/75 to-transparent/10" />

                <div className="relative z-10 w-full h-full flex flex-col justify-center px-6 md:px-16 pt-20 md:pt-28 pb-12">
                    <div className="p-6 md:p-10 max-w-2xl relative z-10">
                        <span className="gsap-hero-badge inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold tracking-wider mb-5 shadow-sm relative z-10">
                            📍 YOUR NEIGHBOURHOOD STORE
                        </span>
                        <h1 className="gsap-hero-title text-4xl md:text-6xl font-extrabold mb-6 leading-tight relative z-10 text-white">
                            Your Daily MiniMart, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400">Now Online.</span>
                        </h1>
                        <p className="gsap-hero-text text-lg text-gray-200 mb-8 leading-relaxed font-medium relative z-10">
                            Skip the market crowd. Get farm-fresh vegetables, daily essentials, and household items from your trusted local shop delivered in minutes.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-8 relative z-10">
                            <Link to="/shop" className="gsap-hero-cta group bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-8 py-3.5 rounded-full font-bold text-lg shadow-lg hover:shadow-indigo-500/40 transition-all flex items-center transform hover:-translate-y-0.5">
                                Order Now
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/signup" className="gsap-hero-cta px-8 py-3.5 rounded-full font-bold text-lg bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all text-white hover:border-white/40 shadow-sm hover:shadow-md">
                                Join Us
                            </Link>
                        </div>

                        <div className="flex items-center gap-6 pt-6 border-t border-white/10 relative z-10">
                            <div className="gsap-hero-stats">
                                <p className="text-2xl font-bold text-white">10<span className="text-amber-400 text-sm align-top">+</span></p>
                                <p className="text-xs text-gray-300 uppercase font-semibold">Mins Delivery</p>
                            </div>
                            <div className="w-px h-8 bg-white/20"></div>
                            <div className="gsap-hero-stats">
                                <p className="text-2xl font-bold text-white">100<span className="text-amber-400 text-sm align-top">%</span></p>
                                <p className="text-xs text-gray-300 uppercase font-semibold">Fresh Quality</p>
                            </div>
                            <div className="w-px h-8 bg-white/20"></div>
                            <div className="gsap-hero-stats">
                                <p className="text-2xl font-bold text-white">4.9<span className="text-amber-400 text-sm align-top">★</span></p>
                                <p className="text-xs text-gray-300 uppercase font-semibold">Store Rating</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shop by Category Section - GSAP Stagger Grid */}
            <section ref={categoryGridRef} className="mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                    <div>
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-wider uppercase mb-2">
                            Explore Store Aisles
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-700">
                            All Categories
                        </h2>
                        <p className="text-gray-600 mt-1">Browse our complete collection of fresh groceries and daily essentials</p>
                    </div>
                    <Link 
                        to="/shop" 
                        className="mt-4 md:mt-0 inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors group"
                    >
                        View All in Shop <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader className="animate-spin text-indigo-600" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {featuredCategories.map((category) => (
                            <Link 
                                to={`/shop?category=${encodeURIComponent(category.name)}`} 
                                key={category._id} 
                                className="gsap-category-card group block text-center"
                            >
                                <div className="relative rounded-2xl overflow-hidden aspect-square mb-3 border border-gray-100 group-hover:border-indigo-300 shadow-sm group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 bg-white p-2">
                                    <img
                                        src={category.image || 'https://images.unsplash.com/photo-1604719312566-b7cb48960fa2?auto=format&fit=crop&w=400&q=80'}
                                        alt={category.name}
                                        className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {category.subcategories && category.subcategories.length > 0 && (
                                        <span className="absolute bottom-3 right-3 bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            {category.subcategories.length} Sub
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors text-sm line-clamp-1">
                                    {category.name}
                                </h3>
                            </Link>
                        ))}
                        {featuredCategories.length === 0 && !loading && (
                            <div className="col-span-full text-center text-gray-500 py-10">
                                <p>No categories found.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Special Offers Section */}
            <section ref={offersRef} className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-violet-700 flex items-center">
                            <Tag className="mr-3 text-red-500" /> Exclusive Offers
                        </h2>
                        <p className="text-gray-600 mt-2">Grab the best deals before they are gone!</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Morning Essentials",
                            discount: "Up to 40% OFF",
                            desc: "On Tea, Coffee & Breakfast items",
                            color: "from-amber-400 to-orange-500",
                            image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
                            link: "/shop?category=Beverages"
                        },
                        {
                            title: "Healthy Snacking",
                            discount: "Buy 1 Get 1 Free",
                            desc: "On selected dry fruits & nuts",
                            color: "from-lime-400 to-green-500",
                            image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=800&q=80",
                            link: "/shop?category=Dry Fruits & Nuts"
                        },
                        {
                            title: "Cooking Basics",
                            discount: "Super Saver Pack",
                            desc: "Oil, Atta & Rice Combo",
                            color: "from-orange-300 to-yellow-500",
                            image: "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80",
                            link: "/shop?category=Oils & Ghee"
                        }
                    ].map((offer, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="relative h-72 rounded-3xl overflow-hidden shadow-xl cursor-pointer group"
                        >
                            <div className="absolute inset-0">
                                <img
                                    src={offer.image}
                                    alt={offer.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-r ${offer.color} opacity-85 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-90`} />
                                <div className="absolute inset-0 bg-black/10 transition-colors" />
                            </div>
                            <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider mb-3 border border-white/30 shadow-sm">
                                        LIMITED TIME
                                    </span>
                                    <h3 className="text-4xl font-black mb-1 leading-tight tracking-tight drop-shadow-md">{offer.discount}</h3>
                                    <p className="font-bold text-xl opacity-95">{offer.title}</p>
                                    <p className="text-sm opacity-90 mt-1 font-medium">{offer.desc}</p>
                                </div>
                                <Link to={offer.link} className="self-start px-6 py-2.5 bg-white text-gray-900 rounded-full font-bold text-sm shadow-xl hover:bg-gray-50 hover:scale-105 transition-all flex items-center group-hover:shadow-2xl">
                                    Shop Now <ArrowRight size={16} className="ml-2" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Quick Order via WhatsApp - Kirana Special with GSAP Floating Graphic */}
            <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-12 border border-green-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
                <div className="flex-1 space-y-6 relative z-10">
                    <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-wide uppercase">
                        📝 Fastest Way To Order
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-violet-700 leading-tight">
                        Have a handwritten list? <br />
                        <span className="text-green-600">Just type & send!</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        Don't want to search? Just type your list of items (e.g., "1kg Sugar, 2 Pepsodent, 5kg Rice") and send it to us directly on WhatsApp. We'll pack it for you!
                    </p>
                    <div className="bg-white p-2 rounded-2xl shadow-md border border-gray-100 flex flex-col sm:flex-row gap-2 transition-shadow hover:shadow-lg">
                        <textarea
                            id="quick-order-text"
                            placeholder="Type your items here... (e.g. 1kg Dal, 2 Soaps)"
                            className="flex-1 p-4 outline-none resize-none text-gray-700 min-h-[80px] sm:min-h-0 bg-transparent"
                        ></textarea>
                        <button
                            onClick={() => {
                                const text = document.getElementById('quick-order-text').value;
                                if (text) window.open(`https://wa.me/917367850872?text=${encodeURIComponent('Hi, here is my order list:\n' + text)}`, '_blank');
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center whitespace-nowrap shadow-green-200 shadow-lg hover:shadow-xl"
                        >
                            Send on WhatsApp <ArrowRight size={18} className="ml-2" />
                        </button>
                    </div>
                </div>
                <div className="hidden md:block w-1/3 relative z-10">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/3670/3670051.png"
                        alt="WhatsApp Order"
                        className="gsap-float w-full h-auto drop-shadow-2xl"
                    />
                </div>
            </section>

            {/* Feature Highlights */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: <Truck size={32} />, title: 'Fast Delivery', desc: 'Get your order in minutes, not hours.' },
                    { icon: <ShieldCheck size={32} />, title: 'Quality Guarantee', desc: 'Freshness guaranteed or your money back.' },
                    { icon: <Clock size={32} />, title: '24/7 Service', desc: 'Order anytime, we fit your schedule.' },
                ].map((feature, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
                    >
                        <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.desc}</p>
                    </motion.div>
                ))}
            </section>
        </div>
    );
};

export default HomePage;
