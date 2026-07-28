import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductForm from '../../components/ProductForm';
import { ArrowLeft, Loader } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ProductFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(!!id);

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                try {
                    const { data } = await api.get(`/products/${id}`);
                    setProduct(data);
                } catch (error) {
                    console.error('Error fetching product', error);
                    toast.error('Failed to load product details');
                    navigate('/admin/products');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, navigate]);

    const handleSuccess = () => {
        navigate('/admin/products');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center mb-6">
                <Link to="/admin/products" className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-600">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    {id ? 'Edit Product' : 'Add New Product'}
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <ProductForm product={product} onSuccess={handleSuccess} />
            </div>
        </div>
    );
};

export default ProductFormPage;
