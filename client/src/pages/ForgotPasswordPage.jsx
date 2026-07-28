import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [resetUrl, setResetUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/users/forgotpassword', { email });
            setResetUrl(response.data.resetUrl); // Capture the dev mode URL
            setEmailSent(true);
            toast.success('Reset link ready!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 glass p-8 rounded-2xl relative z-10"
            >
                <div>
                    <h2 className="mt-2 text-center text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                        Forgot Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Enter your email to receive a reset link
                    </p>
                </div>

                {emailSent ? (
                    <div className="text-center space-y-4">
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100">
                            <p>Reset link created for <strong>{email}</strong></p>
                            <p className="text-sm mt-2 text-gray-600">Since this is a development environment, no actual email was sent.</p>
                        </div>

                        {resetUrl && (
                            <div className="pt-4 pb-2">
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Development Mode</p>
                                <a
                                    href={resetUrl}
                                    className="block w-full text-center bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold py-3 px-4 rounded-xl transition-colors border border-indigo-200 shadow-sm"
                                >
                                    Click Here to Reset Password
                                </a>
                            </div>
                        )}

                        <div className="pt-2">
                            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 underline">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex justify-center items-center bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-none shadow-lg shadow-indigo-500/30"
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : 'Send Reset Link'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center mt-4">
                    <Link to="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-primary transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
