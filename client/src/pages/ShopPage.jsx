import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { fetchWithCache } from '../utils/queryCache';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

const ShopPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState({ name: 'All', icon: '🛍️', _id: 'all' });
    const [priceRange, setPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('default');

    // Parse URL params
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search') || '';
    const urlPage = parseInt(searchParams.get('page') || '1');

    // Sync state with URL params
    useEffect(() => {
        setPage(urlPage > 0 ? urlPage : 1);
    }, [urlPage]);

    // Fetch categories on mount with cache
    useEffect(() => {
        let isMounted = true;
        const loadCategories = async () => {
            try {
                const data = await fetchWithCache('categories_list', async () => {
                    const res = await api.get('/categories');
                    return res.data;
                });

                if (!isMounted) return;

                const fetchedCats = (data || []).map(c => ({
                    ...c,
                    icon: '📦',
                }));

                setCategories([{ name: 'All', icon: '🛍️', _id: 'all' }, ...fetchedCats]);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        loadCategories();
        return () => { isMounted = false; };
    }, []);

    // Set selected category based on URL
    useEffect(() => {
        if (urlCategory) {
            const foundCat = categories.find(c => c.name === urlCategory || c.name.includes(urlCategory));
            if (foundCat) setSelectedCategory(foundCat);
            else setSelectedCategory({ name: urlCategory, icon: '🔍' });
        } else if (urlSearch) {
            setSelectedCategory({ name: 'Search Results', icon: '🔍' });
        } else {
            setSelectedCategory({ name: 'All', icon: '🛍️', _id: 'all' });
        }
    }, [urlCategory, urlSearch, categories]);

    // Fetch products with server-side pagination, caching, and deduplication
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const loadProducts = async () => {
            const catParam = selectedCategory._id && selectedCategory._id !== 'all' 
                ? selectedCategory._id 
                : selectedCategory.name !== 'Search Results' && selectedCategory.name !== 'All' 
                    ? selectedCategory.name 
                    : '';

            const cacheKey = `products_page_${page}_limit_20_cat_${catParam}_search_${urlSearch}_price_${priceRange}_sort_${sortBy}`;

            try {
                const data = await fetchWithCache(cacheKey, async () => {
                    const queryParams = new URLSearchParams({
                        page: page.toString(),
                        limit: '20',
                    });

                    if (catParam) queryParams.set('category', catParam);
                    if (urlSearch) queryParams.set('search', urlSearch);
                    if (priceRange !== 'all') queryParams.set('priceRange', priceRange);
                    if (sortBy !== 'default') queryParams.set('sortBy', sortBy);

                    const res = await api.get(`/products?${queryParams.toString()}`);
                    return res.data;
                });

                if (!isMounted) return;

                if (Array.isArray(data)) {
                    setProducts(data);
                    setPages(1);
                    setTotalProducts(data.length);
                } else if (data && data.products) {
                    setProducts(data.products || []);
                    setPage(data.page || 1);
                    setPages(data.pages || 1);
                    setTotalProducts(data.total || 0);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                if (isMounted) setProducts([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadProducts();

        return () => { isMounted = false; };
    }, [page, selectedCategory, urlSearch, priceRange, sortBy]);

    // Handlers
    const handleCategoryClick = useCallback((catName) => {
        const params = new URLSearchParams(location.search);
        params.set('page', '1');
        if (catName === 'All') {
            params.delete('category');
        } else {
            params.set('category', catName);
        }
        navigate({ search: params.toString() });
    }, [navigate, location.search]);

    const handlePageChange = useCallback((newPage) => {
        if (newPage < 1 || newPage > pages) return;
        const params = new URLSearchParams(location.search);
        params.set('page', newPage.toString());
        navigate({ search: params.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [navigate, location.search, pages]);

    const handleSearchChange = useCallback((e) => {
        const val = e.target.value;
        const params = new URLSearchParams(location.search);
        params.set('page', '1');
        if (val.trim()) {
            params.set('search', val.trim());
        } else {
            params.delete('search');
        }
        navigate({ search: params.toString() }, { replace: true });
    }, [navigate, location.search]);

    const handleResetFilters = useCallback(() => {
        setPriceRange('all');
        setSortBy('default');
        navigate('/shop');
    }, [navigate]);

    return (
        <div className="bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
                    
                    {/* Sidebar / Filters */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-6">
                        
                        {/* Categories Section */}
                        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hidden md:block">
                            <h3 className="font-extrabold text-base mb-3.5 text-slate-900 flex items-center justify-between">
                                Top Categories
                            </h3>
                            <div className="space-y-1 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
                                {categories.map(cat => (
                                    <button
                                        key={cat._id || cat.name}
                                        type="button"
                                        onClick={() => handleCategoryClick(cat.name)}
                                        className={`flex items-center w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold border ${
                                            (selectedCategory.name === cat.name || (selectedCategory.name === 'All' && cat.name === 'All'))
                                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                                                : 'border-transparent text-slate-700 hover:bg-slate-100 hover:text-indigo-600'
                                        }`}
                                    >
                                        <span className="mr-2.5 text-base">{cat.icon}</span>
                                        <span className="truncate">{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm sticky top-24 space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-extrabold text-base text-slate-900 flex items-center">
                                        <Filter size={18} className="mr-2 text-indigo-600" /> Filters
                                    </h3>
                                    {(priceRange !== 'all' || sortBy !== 'default' || urlSearch) && (
                                        <button
                                            type="button"
                                            onClick={handleResetFilters}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>

                                {/* Search Bar */}
                                <div className="mb-5 relative">
                                    <input
                                        type="text"
                                        placeholder="Search groceries..."
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none font-medium text-xs text-slate-800"
                                        onChange={handleSearchChange}
                                        defaultValue={urlSearch}
                                    />
                                    <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                                </div>

                                {/* Sort By */}
                                <div className="mb-5">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 font-semibold text-xs text-slate-700 outline-none cursor-pointer"
                                    >
                                        <option value="default">✨ Featured</option>
                                        <option value="low-high">💰 Price: Low to High</option>
                                        <option value="high-low">💎 Price: High to Low</option>
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Price Range</label>
                                    <div className="space-y-1.5">
                                        {[
                                            { label: 'All Prices', value: 'all' },
                                            { label: 'Under ₹50', value: '0-50' },
                                            { label: '₹50 - ₹100', value: '50-100' },
                                            { label: '₹100 - ₹200', value: '100-200' },
                                            { label: '₹200+', value: '200+' }
                                        ].map((range) => (
                                            <button
                                                key={range.value}
                                                type="button"
                                                onClick={() => setPriceRange(range.value)}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                                                    priceRange === range.value
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                        : 'border-transparent text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid & Main Content */}
                    <div className="flex-1 space-y-6">
                        
                        {/* Header Banner (Clean Layout - No heavy floating graphics) */}
                        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                                        Fresh Supermarket Stock
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                        {selectedCategory.name === 'All' ? 'All Groceries & Essentials' : selectedCategory.name}
                                    </h1>
                                    <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                                        Showing {totalProducts} items available for instant delivery.
                                    </p>
                                </div>

                                {selectedCategory.image && (
                                    <img
                                        src={selectedCategory.image}
                                        alt={selectedCategory.name}
                                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {products.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {pages > 1 && (
                                    <div className="flex items-center justify-center space-x-2 pt-8 pb-4">
                                        <button
                                            type="button"
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>

                                        {[...Array(pages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    type="button"
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-10 h-10 rounded-xl font-bold text-xs transition-all border ${
                                                        page === pageNum
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            type="button"
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === pages}
                                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
                                <div className="text-4xl mb-3">🔍</div>
                                <h3 className="text-lg font-extrabold text-slate-900">No products found</h3>
                                <p className="text-xs text-slate-500 mt-1">Try selecting a different category or search term.</p>
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    View All Products
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
