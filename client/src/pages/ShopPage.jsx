import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';

const ShopPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState({ name: 'All', icon: '🛍️' });
    const [priceRange, setPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('default');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch products and categories in parallel
                /*
                   Note: The previous code imported `api` as the default export from `../utils/api`.
                   We need to update imports to use the named exports from `../services/api` or simply use the default export if we kept it.
                   Let's use the new services/api.js which exports getProducts and getCategories.
                   I will need to update the import statement at the top of the file as well!
                   Wait, I can't update imports in this block. I will do it in a separate call or try to match the existing import style if possible.
                   Actually, I should update the imports first or handle it here if allowing multiple chunks?
                   The prompt says "Replace the hardcoded categories array and the useEffect...".
                   I'll assume I can update the fetching logic here.
                */
                const [productsData, categoriesData] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories')
                ]);

                setProducts(productsData.data);

                // Process categories: Flatten if valid, otherwise just use data
                // The API returns hierarchical data. We want the top-level ones for the sidebar usually, 
                // but checking the previous hardcoded list, it seemed to be top-level.
                // We'll flatten just in case to find matches easily, or just use top level.
                // Previous hardcoded list was flat.
                // Let's us top level categories from the API.
                const fetchedCats = categoriesData.data.map(c => ({
                    ...c,
                    icon: '📦', // Default icon as DB doesn't have it
                    color: 'bg-gray-50' // Default color
                }));

                setCategories([{ name: 'All', icon: '🛍️', _id: 'all' }, ...fetchedCats]);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const catName = params.get('category');
        const searchQuery = params.get('search');

        if (catName) {
            const foundCat = categories.find(c => c.name === catName || c.name.includes(catName));
            if (foundCat) setSelectedCategory(foundCat);
            else setSelectedCategory({ name: catName, icon: '🔍' });
        } else if (searchQuery) {
            setSelectedCategory({ name: 'Search Results', icon: '🔍' });
        } else {
            setSelectedCategory({ name: 'All', icon: '🛍️' });
        }
    }, [location.search, categories]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search')?.toLowerCase();

        let filtered = [...products];

        // Category Filter
        if (selectedCategory.name !== 'All' && selectedCategory.name !== 'Search Results') {
            filtered = filtered.filter(p =>
                p.category === selectedCategory._id ||
                p.category === selectedCategory.name ||
                (p.category && typeof p.category === 'object' && p.category._id === selectedCategory._id)
            );
        }

        // Search Filter
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery) ||
                p.description.toLowerCase().includes(searchQuery) ||
                (p.brand && p.brand.toLowerCase().includes(searchQuery))
            );
        }

        // Price Range Filter
        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            if (priceRange === '200+') {
                filtered = filtered.filter(p => p.price >= 200);
            } else {
                filtered = filtered.filter(p => p.price >= min && p.price <= max);
            }
        }

        // Sorting
        if (sortBy === 'low-high') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'high-low') {
            filtered.sort((a, b) => b.price - a.price);
        }

        setFilteredProducts(filtered);
    }, [selectedCategory, products, location.search, priceRange, sortBy]);

    const handleCategoryClick = (catName) => {
        const cat = categories.find(c => c.name === catName);
        setSelectedCategory(cat || { name: catName });
    };

    return (
        <div>
            {/* Category Banner (Visible when a specific category is selected and has an image) */}
            {/* Dynamic Hero Section */}


            {/* Standard Header if no banner */}


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Filters */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-8">
                        {/* Categories Section */}
                        <div className="glass rounded-2xl p-6 hidden md:block">
                            <h3 className="font-bold text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-violet-700">Top Categories</h3>
                            <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {categories.slice(1).map(cat => (
                                    <button
                                        key={cat.name}
                                        onClick={() => handleCategoryClick(cat.name)}
                                        className={`flex items-center w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group mb-2 border-2 ${selectedCategory.name === cat.name
                                            ? 'border-primary bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg'
                                            : 'border-white bg-white text-gray-600 hover:border-indigo-100 hover:bg-indigo-50 hover:pl-6 hover:text-primary shadow-sm hover:shadow-md'
                                            }`}
                                    >
                                        <span className={`mr-3 text-lg transition-transform ${selectedCategory.name !== cat.name && 'group-hover:scale-125'}`}>{cat.icon}</span>
                                        <span className="font-medium text-sm">{cat.name}</span>
                                        {selectedCategory.name === cat.name && (
                                            <motion.div layoutId="activeCat" className="ml-auto">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="glass rounded-2xl p-6 sticky top-24 space-y-8 mt-8">
                            <div>
                                <h3 className="font-bold text-lg mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-violet-700 flex justify-between items-center">
                                    Filters
                                    {(priceRange !== 'all' || sortBy !== 'default') && (
                                        <button
                                            onClick={() => { setPriceRange('all'); setSortBy('default'); }}
                                            className="text-xs text-primary font-bold hover:text-primary-dark transition-colors bg-primary/10 px-2 py-1 rounded-lg"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </h3>

                                {/* Search Bar */}
                                <div className="mb-6 relative group">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-transparent bg-gray-50 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-gray-700"
                                        onChange={(e) => {
                                            const params = new URLSearchParams(location.search);
                                            if (e.target.value) params.set('search', e.target.value);
                                            else params.delete('search');
                                            navigate({ search: params.toString() }, { replace: true });
                                        }}
                                        defaultValue={new URLSearchParams(location.search).get('search') || ''}
                                    />
                                    <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Sort By */}
                                <div className="mb-8">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sort By</label>
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl bg-gray-50 hover:bg-white border-2 border-transparent focus:border-primary/30 outline-none font-medium text-gray-700 transition-all cursor-pointer"
                                        >
                                            <option value="default">✨ Featured</option>
                                            <option value="low-high">💰 Price: Low to High</option>
                                            <option value="high-low">💎 Price: High to Low</option>
                                        </select>
                                        <div className="absolute right-4 top-3.5 pointer-events-none text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Price Range</label>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'All Prices', value: 'all' },
                                            { label: 'Under ₹50', value: '0-50' },
                                            { label: '₹50 - ₹100', value: '50-100' },
                                            { label: '₹100 - ₹200', value: '100-200' },
                                            { label: '₹200+', value: '200+' }
                                        ].map((range) => (
                                            <button
                                                key={range.value}
                                                onClick={() => setPriceRange(range.value)}
                                                className={`flex items-center w-full text-left px-4 py-2 rounded-xl transition-all duration-300 group mb-2 border-2 ${priceRange === range.value
                                                    ? 'border-primary bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg'
                                                    : 'border-white bg-white text-gray-600 hover:border-indigo-100 hover:bg-indigo-50 hover:pl-6 hover:text-primary shadow-sm hover:shadow-md'
                                                    }`}
                                            >
                                                <span className="text-sm font-medium">{range.label}</span>
                                                {priceRange === range.value && (
                                                    <motion.div layoutId="activePrice" className="ml-auto">
                                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="relative pt-0 pb-12 overflow-hidden">
                            {/* Modern Abstract BGs */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-multiply"></div>
                                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[100px] mix-blend-multiply"></div>
                            </div>

                            <div className="w-full">
                                <div className="glass-dark rounded-3xl p-8 md:p-12 relative overflow-hidden border border-white/10 shadow-2xl">
                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent pointer-events-none" />

                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                                        <div className="text-center md:text-left space-y-6 max-w-xl">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sky-200 font-semibold text-sm shadow-sm mb-2"
                                            >
                                                <span className="mr-2">✨</span> Premium Quality Groceries
                                            </motion.div>
                                            <motion.h1
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white mb-2"
                                            >
                                                {selectedCategory.name === 'All' ? 'Everything You Need' : selectedCategory.name}
                                            </motion.h1>
                                            <motion.p
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="text-lg text-gray-300 font-medium leading-relaxed max-w-lg"
                                            >
                                                {selectedCategory.name === 'All'
                                                    ? "From farm-fresh veggies to daily pantry staples, we've got you covered."
                                                    : `Explore our premium collection of ${selectedCategory.name}. Freshness guaranteed.`}
                                            </motion.p>
                                        </div>

                                        {selectedCategory.image && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                transition={{ type: "spring", duration: 0.8 }}
                                                className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-sky-500/30 rounded-full blur-3xl opacity-50 animate-pulse" />
                                                <img
                                                    src={selectedCategory.image}
                                                    alt={selectedCategory.name}
                                                    className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 relative z-10"
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
                            </div>
                        ) : (
                            filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {filteredProducts.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                    <div className="text-5xl mb-4">🔍</div>
                                    <h3 className="text-xl font-medium text-gray-900">No products found</h3>
                                    <p className="text-gray-500 mt-2">Try selecting a different category.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
