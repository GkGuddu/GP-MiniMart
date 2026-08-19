import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Loader, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Direct Password Reset Handler (No OTP Required)
    const handleDirectReset = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your registered email');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/users/forgotpassword', {
                email,
                password
            });

            toast.success('Password reset successfully!');
            
            if (data.token) {
                login(data);
                navigate('/');
            } else {
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password. Please check your email.');
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
                    <h2 className="mt-2 text-center text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
                        Forgot Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Enter your email and create a new password directly
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleDirectReset}>
                    {/* Registered Email */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm"
                            placeholder="Registered Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* New Password */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm"
                            placeholder="New Password (min 6 chars)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Confirm New Password */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl border-none shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : (
                                <>
                                    <CheckCircle2 size={18} />
                                    Reset Password & Login
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <Link to="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
