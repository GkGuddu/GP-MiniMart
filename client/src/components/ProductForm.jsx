import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ImageUpload from './ImageUpload';

const ProductForm = ({ product, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        brand: '',
        category: '',
        subcategory: '',
        mrp: '',
        price: '', // Calculated
        gst: 5,
        stock: '',
        unit: '1kg',
        isActive: true,
        expiryDate: ''
    });

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Failed to load categories');
                toast.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                image: product.image,
                brand: product.brand || '',
                category: product.category?._id || product.category || '',
                subcategory: product.subcategory?._id || product.subcategory || '',
                mrp: product.mrp || '',
                price: product.price,
                gst: product.gst || 5,
                stock: product.stock,
                unit: product.unit || '1kg',
                isActive: product.isActive !== undefined ? product.isActive : true,
                expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''
            });
        }
    }, [product]);

    // Update subcategories when category changes
    useEffect(() => {
        if (formData.category) {
            const selectedCat = categories.find(c => c._id === formData.category);
            setSubcategories(selectedCat?.subcategories || []);
        } else {
            setSubcategories([]);
        }
    }, [formData.category, categories]);

    // Auto-calculate Price from MRP (5% Discount)
    useEffect(() => {
        if (formData.mrp) {
            const mrp = parseFloat(formData.mrp);
            const discount = mrp * 0.05;
            setFormData(prev => ({ ...prev, price: Math.round(mrp - discount) }));
        }
    }, [formData.mrp]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (product) {
                await api.put(`/products/${product._id}`, formData);
                toast.success('Product updated');
            } else {
                await api.post('/products', formData);
                toast.success('Product created');
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving product', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save product';
            toast.error(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-gray-900"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-gray-900"
                >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    disabled={!formData.category}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 disabled:bg-gray-100 text-gray-900"
                >
                    <option value="">Select Subcategory</option>
                    {subcategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">MRP (₹)</label>
                <input
                    type="number"
                    name="mrp"
                    required
                    min="0"
                    placeholder="Maximum Retail Price"
                    value={formData.mrp}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-gray-900"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Selling Price (₹) <span className="text-xs text-green-600">(Auto: 5% off)</span></label>
                <input
                    type="number"
                    name="price"
                    readOnly
                    value={formData.price}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-gray-500 cursor-not-allowed"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-gray-900"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <input
                    type="text"
                    name="unit"
                    required
                    placeholder="e.g. 1kg, 500g, 1L"
                    value={formData.unit}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-gray-900"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">GST (%)</label>
                <input
                    type="number"
                    name="gst"
                    min="0"
                    value={formData.gst}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-gray-900"
                />
            </div>



            <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-gray-900"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-gray-900"
                />
            </div>

            <div className="md:col-span-2">
                <ImageUpload
                    label="Product Image"
                    value={formData.image}
                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    name="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-gray-900"
                />
            </div>

            <div className="md:col-span-2 flex items-center">
                <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active (Visible in shop)
                </label>
            </div>

            <div className="md:col-span-2 flex justify-end">
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    {product ? 'Update Product' : 'Add Product'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
