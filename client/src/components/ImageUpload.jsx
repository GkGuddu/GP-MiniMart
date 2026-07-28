import { useState, useRef } from 'react';
import { UploadCloud, Trash2, Image, Loader2, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUpload = ({ value, onChange, label = 'Upload Image' }) => {
    const [uploading, setUploading] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadFile(file);
        }
    };

    const uploadFile = async (file) => {
        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file (PNG, JPG, WEBP, etc.)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onChange(data.url);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Image upload failed:', error);
            const errMsg = error.response?.data?.message || 'Failed to upload image. Check server credentials.';
            toast.error(errMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            await uploadFile(file);
        }
    };

    const handleRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.success('Image removed');
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="block text-sm font-semibold text-gray-700">
                    {label}
                </label>
            )}

            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={!uploading ? triggerFileInput : undefined}
                className={`relative flex flex-col items-center justify-center min-h-[160px] rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all duration-300 ${
                    isDragActive
                        ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                        : value
                        ? 'border-gray-200 bg-gray-50/20 hover:border-indigo-400'
                        : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50/30'
                }`}
            >
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    disabled={uploading}
                    className="hidden"
                />

                <AnimatePresence mode="wait">
                    {uploading ? (
                        <motion.div
                            key="uploading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center p-6 space-y-3"
                        >
                            <div className="relative">
                                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <UploadCloud className="h-4 w-4 text-indigo-400" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-900">Uploading image...</p>
                                <p className="text-xs text-gray-500 mt-0.5">Sending file to Cloudinary</p>
                            </div>
                        </motion.div>
                    ) : value ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="relative w-full h-[180px] group overflow-hidden"
                        >
                            {/* Image Preview */}
                            <img
                                src={value}
                                alt="Preview"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        triggerFileInput();
                                    }}
                                    className="p-2.5 bg-white/95 hover:bg-white text-gray-800 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center gap-1.5 text-xs font-semibold"
                                >
                                    <RefreshCw size={15} />
                                    Change
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 flex items-center gap-1.5 text-xs font-semibold"
                                >
                                    <Trash2 size={15} />
                                    Remove
                                </button>
                            </div>

                            {/* Badge */}
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-md font-semibold backdrop-blur-xs flex items-center gap-1">
                                <Image size={10} /> Live Preview
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center p-6 text-center space-y-2.5"
                        >
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl transition-colors duration-300 group-hover:bg-indigo-100">
                                <UploadCloud className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">
                                    Click to upload or drag & drop
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    PNG, JPG, WEBP or GIF (max. 5MB)
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ImageUpload;
