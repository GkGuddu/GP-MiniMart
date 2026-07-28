import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Star, Truck, ShieldCheck, ArrowLeft, Loader, Plus, Minus, ShoppingCart } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                // Fetch current product
                const { data: productData } = await api.get(`/products/${id}`);
                setProduct(productData);

                // Fetch all products to filter for related (Not ideal for production but works for small scale)
                // In production, backend should have a /products/related/:id endpoint
                const { data: allProducts } = await api.get('/products');
                const related = allProducts
                    .filter(p => p.category === productData.category && p._id !== productData._id)
                    .slice(0, 4);
                setRelatedProducts(related);

            } catch (error) {
                console.error('Failed to fetch product', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
        window.scrollTo(0, 0); // Scroll to top on id change
    }, [id]);

    const handleAddToCart = () => {
        if (!user) {
            toast.error("Please login to shop");
            navigate('/login');
            return;
        }
        addToCart(product, qty);
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader className="animate-spin text-primary" size={48} />
        </div>
    );

    if (!product) return <div className="text-center py-20">Product not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-primary mb-8 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Back to Shop
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {/* Image Gallery (mock) */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-center">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full max-h-[500px] object-contain hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* Details Column */}
                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wide">
                            {product.category}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-2">{product.name}</h1>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} fill={i < Math.round(product.rating || 0) ? "currentColor" : "none"} stroke="currentColor" />
                            ))}
                        </div>
                        <span className="text-gray-500 text-sm">({product.numReviews || 0} reviews)</span>
                    </div>

                    {/* Price & Description */}
                    <div className="border-t border-b border-gray-200 py-6">
                        <div className="flex items-end gap-4">
                            <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
                            <span className="text-lg text-gray-500 mb-1">/ {product.unit}</span>
                        </div>

                        <div className="mt-6 space-y-4">
                            <p className="text-gray-600 leading-relaxed">
                                {product.description || `Premium quality ${product.name} sourced directly from the best farms/distributors. Freshly packed and delivered to your doorstep. Perfect for your daily needs.`}
                            </p>

                            <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-sm mt-6">
                                <span className="font-bold text-gray-900">Brand</span>
                                <span className="text-gray-600">{product.brand || 'FarmFresh'}</span>

                                <span className="font-bold text-gray-900">Expiry Date</span>
                                <span className="text-gray-600">{product.expiryDate || 'Best within 6 months'}</span>

                                <span className="font-bold text-gray-900">Ingredients</span>
                                <span className="text-gray-600">{product.ingredients || '100% Organic ' + product.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <div className="flex items-center border border-gray-300 rounded-xl w-max">
                            <button
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                className="p-2.5 hover:bg-gray-50 text-gray-600 transition-colors"
                            >
                                <Minus size={18} />
                            </button>
                            <span className="px-3 font-bold text-base">{qty}</span>
                            <button
                                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                                className="p-2.5 hover:bg-gray-50 text-gray-600 transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-base hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={20} /> Add to Cart
                        </button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 pt-6">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <Truck className="text-primary" size={24} />
                            <div>
                                <p className="font-bold text-sm">Fast Delivery</p>
                                <p className="text-xs text-gray-500">Within 24 hours</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <ShieldCheck className="text-emerald-600" size={24} />
                            <div>
                                <p className="font-bold text-sm">Quality Check</p>
                                <p className="text-xs text-gray-500">100% Guaranteed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Reviews Section */}
            <div className="border-t border-gray-200 pt-16 mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Reviews List */}
                    <div className="space-y-6">
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((review, index) => (
                                <div key={index} className="bg-gray-50 p-6 rounded-2xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-gray-900">{review.name}</h3>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm">{review.comment}</p>
                                    <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 italic">No reviews yet. Be the first to review!</div>
                        )}
                    </div>

                    {/* Review Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const rating = e.target.rating.value;
                            const comment = e.target.comment.value;
                            // Add API call logic here (mock for now or full implementation)
                            // Ideally needs useContext for User Auth
                            api.post(`/products/${product._id}/reviews`, { rating, comment })
                                .then(() => {
                                    alert('Review submitted successfully!');
                                    window.location.reload();
                                })
                                .catch(err => alert(err.response?.data?.message || 'Error submitting review'));
                        }}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <select name="rating" className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-primary">
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="3">3 - Good</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="1">1 - Poor</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                                <textarea name="comment" rows="4" className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-primary" placeholder="Share your experience..." required></textarea>
                            </div>
                            <button className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">Submit Review</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {
                relatedProducts.length > 0 && (
                    <div className="border-t border-gray-200 pt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(prod => (
                                <ProductCard key={prod._id} product={prod} />
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ProductPage;
