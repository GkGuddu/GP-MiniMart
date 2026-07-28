import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Clock, Loader, Tag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useEffect, useState } from 'react';
import { getProducts, getCategories } from '../services/api';
import toast from 'react-hot-toast';

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [featuredCategories, setFeaturedCategories] = useState([]); // Dynamic featured categories
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategories()
                ]);

                // Process Products
                setFeaturedProducts(productsData.slice(0, 4));

                // Process Categories
                // Flatten categories (top level + subcategories if any returned in structure) 
                // Note: The API currently returns hierarchical data, so subcategories are inside 'subcategories' array.
                const allCats = categoriesData.flatMap(cat => [cat, ...(cat.subcategories || [])]);
                const topCats = allCats.filter(cat => cat.isFeatured);
                setFeaturedCategories(topCats);
            } catch (error) {
                console.error("Error fetching data", error);
                toast.error("Failed to load home page data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-16 pb-12">
            {/* Hero Section */}
            {/* Hero Section */}
            <section className="relative h-[85vh] md:h-[90vh] pb-12 rounded-b-3xl overflow-hidden shadow-2xl">
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center transform scale-105"
                    style={{ backgroundImage: "url('/supermarket_hero_bg.png')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/50 to-transparent/20" />

                <div className="relative z-10 w-full h-full flex flex-col justify-center px-6 md:px-16 pt-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="p-8 md:p-12 max-w-2xl relative z-10"
                    >

                        <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold tracking-wider mb-5 shadow-sm relative z-10">
                            📍 YOUR NEIGHBOURHOOD STORE
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight relative z-10 text-white">
                            Your Daily MiniMart, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">Now Online.</span>
                        </h1>
                        <p className="text-lg text-gray-200 mb-8 leading-relaxed font-medium relative z-10">
                            Skip the market crowd. Get farm-fresh vegetables, daily essentials, and household items from your trusted local shop delivered in minutes.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-8 relative z-10">
                            <Link to="/shop" className="group bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-8 py-3.5 rounded-full font-bold text-lg shadow-lg hover:shadow-indigo-500/40 transition-all flex items-center transform hover:-translate-y-0.5">
                                Order Now
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/signup" className="px-8 py-3.5 rounded-full font-bold text-lg bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all text-white hover:border-white/40 shadow-sm hover:shadow-md">
                                Join Us
                            </Link>
                        </div>

                        <div className="flex items-center gap-6 pt-6 border-t border-white/10 relative z-10">
                            <div>
                                <p className="text-2xl font-bold text-white">10<span className="text-amber-400 text-sm align-top">+</span></p>
                                <p className="text-xs text-gray-300 uppercase font-semibold">Mins Delivery</p>
                            </div>
                            <div className="w-px h-8 bg-white/20"></div>
                            <div>
                                <p className="text-2xl font-bold text-white">100<span className="text-amber-400 text-sm align-top">%</span></p>
                                <p className="text-xs text-gray-300 uppercase font-semibold">Fresh Quality</p>
                            </div>
                            <div className="w-px h-8 bg-white/20"></div>
                            <div>
                                <p className="text-2xl font-bold text-white">4.9<span className="text-amber-400 text-sm align-top">★</span></p>
                                <p className="text-xs text-gray-300 uppercase font-semibold">Store Rating</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Shop by Category Section */}
            <section>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-violet-700">Top Categories</h2>
                    <p className="text-gray-600 mt-2">Find everything you need in our organized aisles</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader className="animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {/* We will fetch all categories, flatten them if needed, and filter by isFeatured */}
                        {featuredCategories.map((category) => (
                            <Link to={`/shop?category=${encodeURIComponent(category.name)}`} key={category._id} className="group block text-center">
                                <div className="relative rounded-full overflow-hidden aspect-square mb-4 border-2 border-transparent group-hover:border-primary/20 shadow-sm group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 bg-white w-40 h-40 mx-auto">
                                    <img
                                        src={category.image || 'https://images.unsplash.com/photo-1604719312566-b7cb48960fa2?auto=format&fit=crop&w=400&q=80'}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                </div>
                                <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors text-lg">{category.name}</h3>
                            </Link>
                        ))}
                        {featuredCategories.length === 0 && !loading && (
                            <div className="col-span-full text-center text-gray-500 py-10">
                                <p>No top categories selected. Visit Admin Panel to feature categories here.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Special Offers Section */}
            <section className="mb-16">
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

            {/* Quick Order via WhatsApp - Kirana Special */}
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
                        className="w-full h-auto drop-shadow-2xl animate-float"
                    />
                </div>
            </section>

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

            {/* Testimonials - Social Proof */}
            <section className="mb-16 relative">
                <div className="absolute top-1/2 left-0 w-full h-64 bg-gray-50 -z-10 -skew-y-3 transform origin-left"></div>
                <div className="text-center mb-12">
                    <span className="text-primary font-bold tracking-wider uppercase text-sm">Testimonials</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-violet-700 mt-2">What Our Neighbors Say</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: 'Priya Sharma', role: 'Homemaker', text: 'The quality of Dal and Rice is amazing. Much better than what I get at the local market, and delivered to my door!' },
                        { name: 'Rahul Verma', role: 'IT Professional', text: 'Quick ordering via WhatsApp is a game changer. I just send a photo of my list and done. Highly recommended!' },
                        { name: 'Anita Desai', role: 'Teacher', text: 'Love the "Deal of the Day" offers. I stock up on monthly essentials at great prices. Very professional service.' },
                    ].map((review, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative hover:-translate-y-2 transition-transform duration-300">
                            <div className="absolute top-6 right-6 text-indigo-100">
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
                            </div>
                            <p className="text-gray-600 mb-6 italic relative z-10 leading-relaxed">"{review.text}"</p>
                            <div className="flex items-center pt-4 border-t border-gray-50">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white mr-4 shadow-md">
                                    {review.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                                    <span className="text-xs text-primary font-semibold tracking-wide uppercase">{review.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-violet-700">Featured Products</h2>
                        <p className="text-gray-600 mt-2">Hand-picked selections just for you</p>
                    </div>
                    <Link to="/shop" className="text-primary font-semibold hover:text-indigo-700 flex items-center">
                        View All <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <Loader className="animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-gray-500">Loading fresh items...</p>
                    </div>
                ) : featuredProducts.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {featuredProducts.map((product) => (
                            <motion.div key={product._id} variants={itemVariants}>
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl">
                        <ShoppingBag className="mx-auto text-gray-400 mb-2" size={48} />
                        <p className="text-gray-500">No products found. time to stock up!</p>
                    </div>
                )}
            </section>

            {/* Banner */}
            <section className="relative rounded-3xl overflow-hidden bg-gray-900 text-white shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
                <div className="relative z-10 px-8 py-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start shopping?</h2>
                    <p className="text-gray-300 mb-8 max-w-xl mx-auto">Join thousands of happy customers who get their groceries delivered fresh and fast.</p>
                    <Link to="/shop" className="inline-block bg-accent hover:bg-amber-600 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg hover:shadow-accent/40 transform hover:-translate-y-1">
                        Start Shopping
                    </Link>
                </div>
            </section>
        </div >
    );
};

export default HomePage;
