import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { User, Mail, Package, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
    const { user, logout } = useContext(AuthContext);

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden glass border border-white/20"
            >
                <div className="bg-gradient-to-r from-primary to-secondary h-32 relative">
                    <div className="absolute -bottom-16 left-8">
                        <div className="w-32 h-32 rounded-full border-4 border-white bg-white flex items-center justify-center text-4xl font-bold text-primary shadow-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="pt-20 pb-8 px-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                            <div className="flex items-center text-gray-600 mt-2">
                                <Mail size={18} className="mr-2" />
                                <span>{user.email}</span>
                            </div>
                            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-primary">
                                {user.role === 'admin' ? 'Administrator' : 'Customer'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link to="/myorders" className="block group">
                            <div className="p-6 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-gray-100 group-hover:border-primary/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-indigo-100 text-primary rounded-lg">
                                            <Package size={24} />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">My Orders</h3>
                                            <p className="text-sm text-gray-500">Track and view your order history</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <div onClick={logout} className="block group cursor-pointer">
                            <div className="p-6 bg-red-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-red-50 hover:border-red-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                                            <LogOut size={24} />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Logout</h3>
                                            <p className="text-sm text-gray-500">Sign out of your account</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
