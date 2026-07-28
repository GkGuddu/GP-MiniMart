import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const BlogCard = ({ post }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-full"
        >
            <div className="relative h-48 overflow-hidden group">
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                        {post.category}
                    </span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-gray-500 text-sm mb-3 space-x-4">
                    <div className="flex items-center">
                        <Calendar size={14} className="mr-1.5" />
                        <span>{post.date}</span>
                    </div>
                    <div className="flex items-center">
                        <User size={14} className="mr-1.5" />
                        <span>{post.author}</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-emerald-600 transition-colors">
                    <Link to={`/blog/${post.id}`}>
                        {post.title}
                    </Link>
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                </p>

                <div className="mt-auto">
                    <Link
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors group"
                    >
                        Read More
                        <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default BlogCard;
