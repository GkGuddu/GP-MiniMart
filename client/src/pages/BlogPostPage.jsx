import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { blogData } from '../data/blogData';

const BlogPostPage = () => {
    const { id } = useParams();
    const post = blogData.find(p => p.id === parseInt(id));

    if (!post) {
        return (
            <div className="min-h-screen bg-blue-950 pt-32 pb-12 px-4 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Post not found</h2>
                <Link to="/blog" className="text-emerald-400 hover:text-emerald-300 font-medium">
                    Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden"
            >
                {/* Hero Image */}
                <div className="h-64 md:h-96 w-full overflow-hidden relative">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-8 w-full">
                            <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 inline-block shadow-sm">
                                {post.category}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 font-display">
                                {post.title}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12">
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center text-gray-500 text-sm mb-8 border-b border-gray-100 pb-8 gap-6">
                        <Link
                            to="/blog"
                            className="flex items-center text-emerald-600 font-medium hover:text-emerald-700 mr-auto"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Blog
                        </Link>

                        <div className="flex items-center">
                            <Calendar size={16} className="mr-2 text-emerald-500" />
                            <span>{post.date}</span>
                        </div>
                        <div className="flex items-center">
                            <User size={16} className="mr-2 text-emerald-500" />
                            <span>{post.author}</span>
                        </div>
                    </div>

                    {/* Body */}
                    <div
                        className="prose prose-lg prose-emerald max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default BlogPostPage;
