import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Folder, LayoutGrid, Pencil } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        parent: '', // For subcategory
        isFeatured: false // New field
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories', error);
            toast.error('Failed to load categories');
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories(); // Refresh to handle parent/child updates correctly
                toast.success('Category deleted');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete category');
            }
        }
    };

    const handleEditCategory = (category) => {
        setFormData({
            name: category.name,
            image: category.image,
            parent: category.parent || '',
            isFeatured: category.isFeatured || false
        });
        setEditingId(category._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddSubcategory = (parentId) => {
        setFormData({ name: '', image: '', parent: parentId, isFeatured: false });
        setEditingId(null);
        setShowForm(true);
        // Optional: Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/categories/${editingId}`, formData);
                toast.success('Category updated');
            } else {
                await api.post('/categories', formData);
                toast.success('Category created');
            }
            setShowForm(false);
            setFormData({ name: '', image: '', parent: '', isFeatured: false });
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category', error);
            toast.error('Failed to save category');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                <button
                    onClick={() => {
                        setFormData({ name: '', image: '', parent: '', isFeatured: false });
                        setEditingId(null);
                        setShowForm(!showForm);
                    }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
                >
                    {showForm ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
                    {showForm ? 'Cancel' : 'Add Category'}
                </button>
            </div>

            {/* Add/Edit Category Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6 transition-all">
                    <h2 className="text-lg font-semibold mb-4">
                        {editingId ? 'Edit Category' : (formData.parent ? 'Add Subcategory' : 'Add New Category')}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm text-gray-900"
                                />
                            </div>
                            <div>
                                <ImageUpload
                                    label="Category Image"
                                    value={formData.image}
                                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Parent Category</label>
                                <select
                                    value={formData.parent}
                                    onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm text-gray-900 bg-gray-50"
                                >
                                    <option value="">None (Top Level)</option>
                                    {categories.filter(c => c._id !== editingId).map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Feature on Home Page</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                {editingId ? 'Update Category' : (formData.parent ? 'Save Subcategory' : 'Save Category')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <div className="col-span-full text-center">Loading...</div> : categories.map((cat) => (
                    <div key={cat._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {cat.image ? <img src={cat.image} alt="" className="h-full w-full object-cover" /> : <Folder className="text-gray-400" />}
                                </div>
                                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                                {cat.isFeatured && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200" title="Top Category">⭐ Top</span>}
                            </div>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => handleEditCategory(cat)}
                                    className="text-gray-400 hover:text-blue-600 transition p-1"
                                    title="Edit"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteCategory(cat._id)}
                                    className="text-gray-400 hover:text-red-600 transition p-1"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Subcategories Section */}
                        <div className="mt-2 bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center">
                                    <LayoutGrid size={12} className="mr-1" /> Subcategories
                                </h4>
                                <button
                                    onClick={() => handleAddSubcategory(cat._id)}
                                    className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full p-1 transition"
                                    title="Add Subcategory"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {cat.subcategories && cat.subcategories.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {cat.subcategories.map(sub => (
                                        <div key={sub._id} className="group relative bg-white px-2 py-1 rounded border border-gray-200 text-xs flex items-center transition hover:border-blue-200 text-gray-700">
                                            <span>{sub.name}</span>
                                            <div className="opacity-0 group-hover:opacity-100 flex ml-2 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEditCategory({ ...sub, parent: cat._id }); }}
                                                    className="text-gray-400 hover:text-blue-500 mr-1"
                                                    title="Edit"
                                                >
                                                    <Pencil size={12} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(sub._id); }}
                                                    className="text-gray-400 hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No subcategories yet</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {!loading && categories.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                    No categories found. Add one to get started.
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
