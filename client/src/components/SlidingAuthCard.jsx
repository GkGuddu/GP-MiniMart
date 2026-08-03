import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Loader, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';

const SlidingAuthCard = ({ initialIsSignUp = false }) => {
    const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Login Form State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    // Signup Form State
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);

    const redirectInUrl = new URLSearchParams(location.search).get('redirect');
    const redirect = redirectInUrl ? `/${redirectInUrl}` : '/';

    useEffect(() => {
        setIsSignUp(initialIsSignUp);
    }, [initialIsSignUp]);

    // Google OAuth Handler (Single Hook Initialization)
    const handleGoogleSuccess = async (tokenResponse) => {
        try {
            toast.loading('Signing in with Google...', { id: 'google-auth' });
            
            let userInfo;
            if (tokenResponse.access_token) {
                const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                userInfo = await googleRes.json();
            }

            const { data } = await api.post('/users/google', { userInfo });
            
            toast.success(`Welcome back, ${data.name}!`, { id: 'google-auth' });
            login(data);
            navigate(redirect);
        } catch (error) {
            console.error('Google Sign In Error:', error);
            toast.error(error.response?.data?.message || 'Google Sign-In failed.', { id: 'google-auth' });
        }
    };

    const triggerGoogleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: (err) => {
            console.error('Google OAuth Error:', err);
            toast.error('Google Sign-In popup failed or was closed');
        }
    });

    // Handle Login Submit
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        const res = await login(loginEmail, loginPassword);
        setLoginLoading(false);

        if (res.success) {
            toast.success('Logged in successfully!');
            navigate(redirect);
        } else {
            toast.error(res.message || 'Invalid login credentials');
        }
    };

    // Handle Signup Submit
    const handleSignupSubmit = async (e) => {
        e.preventDefault();

        if (signupPassword !== signupConfirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (signupPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setSignupLoading(true);
        const res = await register(signupName, signupEmail, signupPassword);
        setSignupLoading(false);

        if (res.success) {
            toast.success('Account created successfully!');
            navigate('/');
        } else {
            toast.error(res.message || 'Failed to create account');
        }
    };

    const toggleMode = (signUpState) => {
        setIsSignUp(signUpState);
        if (signUpState) {
            navigate('/signup', { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/70 to-purple-100/80 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Top Back to Home Button */}
            <div className="absolute top-6 left-6 z-30">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-indigo-600 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-200/80 transition-all hover:shadow-md"
                >
                    <ArrowLeft size={16} className="mr-1.5" /> Back to Store
                </Link>
            </div>

            {/* Main Auth Container Card */}
            <div className="w-full max-w-[880px] min-h-[540px] bg-white rounded-[32px] shadow-2xl shadow-indigo-500/10 relative overflow-hidden border border-gray-100/80 flex flex-col md:flex-row">
                
                {/* -------------------- SIGN IN FORM PANEL -------------------- */}
                <div 
                    className={`w-full md:w-1/2 min-h-[540px] p-8 md:p-12 flex flex-col justify-center items-center transition-all duration-700 ease-in-out ${
                        isSignUp ? 'opacity-0 pointer-events-none md:translate-x-full z-10' : 'opacity-100 z-20 md:translate-x-0'
                    }`}
                >
                    <div className="w-full max-w-sm text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                            Sign In
                        </h2>

                        {/* Social Buttons - Google, FB, Insta, Twitter */}
                        <div className="flex justify-center gap-3 mb-4">
                            {/* Google */}
                            <button 
                                type="button" 
                                onClick={() => triggerGoogleLogin()} 
                                title="Sign in with Google" 
                                className="w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                            >
                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
                            </button>
                            {/* Facebook */}
                            <button type="button" title="Facebook" className="w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group">
                                <svg className="w-5 h-5 text-[#1877F2] transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </button>
                            {/* Instagram */}
                            <button type="button" title="Instagram" className="w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group">
                                <svg className="w-5 h-5 text-[#E4405F] transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </button>
                            {/* Twitter */}
                            <button type="button" title="Twitter" className="w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group">
                                <svg className="w-5 h-5 text-[#1DA1F2] transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
                                </svg>
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 font-medium mb-4">
                            or use your email password
                        </p>

                        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                            {/* Email */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100/70 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    placeholder="Email address"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showLoginPassword ? 'text' : 'password'}
                                    required
                                    className="w-full pl-10 pr-10 py-2.5 bg-gray-100/70 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    placeholder="Password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="text-right">
                                <Link to="/forgot-password" className="text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loginLoading}
                                className="w-full mt-2 py-3 bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all flex items-center justify-center"
                            >
                                {loginLoading ? <Loader className="animate-spin" size={18} /> : 'SIGN IN'}
                            </button>
                        </form>

                        {/* Mobile Switch Button */}
                        <div className="mt-4 md:hidden text-center">
                            <p className="text-xs text-gray-500">Don't have an account?</p>
                            <button
                                onClick={() => toggleMode(true)}
                                className="mt-2 text-xs font-bold text-indigo-600 underline"
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>

                {/* -------------------- SIGN UP FORM PANEL -------------------- */}
                <div 
                    className={`w-full md:w-1/2 min-h-[540px] p-8 md:p-12 flex flex-col justify-center items-center transition-all duration-700 ease-in-out ${
                        !isSignUp ? 'opacity-0 pointer-events-none md:-translate-x-full z-10' : 'opacity-100 z-20 md:translate-x-0'
                    }`}
                >
                    <div className="w-full max-w-sm text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                            Create Account
                        </h2>

                        {/* Social Buttons - Google, FB, Insta, Twitter */}
                        <div className="flex justify-center gap-3 mb-3">
                            {/* Google */}
                            <button 
                                type="button" 
                                onClick={() => triggerGoogleLogin()} 
                                title="Sign up with Google" 
                                className="w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                            >
                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
                            </button>
                            {/* Facebook */}
                            <button type="button" title="Facebook" className="w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group">
                                <svg className="w-5 h-5 text-[#1877F2] transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </button>
                            {/* Instagram */}
                            <button type="button" title="Instagram" className="w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group">
                                <svg className="w-5 h-5 text-[#E4405F] transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </button>
                            {/* Twitter */}
                            <button type="button" title="Twitter" className="w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group">
                                <svg className="w-5 h-5 text-[#1DA1F2] transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
                                </svg>
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 font-medium mb-3">
                            or use your email for registration
                        </p>

                        <form onSubmit={handleSignupSubmit} className="space-y-2.5">
                            {/* Name */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100/70 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    placeholder="Name"
                                    value={signupName}
                                    onChange={(e) => setSignupName(e.target.value)}
                                />
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100/70 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    placeholder="Email"
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showSignupPassword ? 'text' : 'password'}
                                    required
                                    className="w-full pl-10 pr-10 py-2.5 bg-gray-100/70 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    placeholder="Password"
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Confirm Password */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showSignupConfirmPassword ? 'text' : 'password'}
                                    required
                                    className="w-full pl-10 pr-10 py-2.5 bg-gray-100/70 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    placeholder="Confirm Password"
                                    value={signupConfirmPassword}
                                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showSignupConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={signupLoading}
                                className="w-full mt-2 py-3 bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all flex items-center justify-center"
                            >
                                {signupLoading ? <Loader className="animate-spin" size={18} /> : 'SIGN UP'}
                            </button>
                        </form>

                        {/* Mobile Switch Button */}
                        <div className="mt-4 md:hidden text-center">
                            <p className="text-xs text-gray-500">Already have an account?</p>
                            <button
                                onClick={() => toggleMode(false)}
                                className="mt-2 text-xs font-bold text-indigo-600 underline"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>

                {/* -------------------- ANIMATED SLIDING PURPLE OVERLAY PANEL -------------------- */}
                <motion.div
                    initial={false}
                    animate={{
                        x: isSignUp ? '0%' : '100%',
                    }}
                    transition={{
                        duration: 0.7,
                        ease: [0.65, 0, 0.35, 1],
                    }}
                    className={`hidden md:flex absolute top-0 left-0 w-1/2 h-full z-30 bg-gradient-to-br from-indigo-700 via-purple-700 to-purple-900 text-white p-12 flex-col justify-center items-center text-center shadow-2xl transition-all duration-700 ${
                        isSignUp ? 'rounded-r-[140px]' : 'rounded-l-[140px]'
                    }`}
                >
                    <AnimatePresence mode="wait">
                        {!isSignUp ? (
                            <motion.div
                                key="hello-friend"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6 max-w-xs"
                            >
                                <h2 className="text-4xl font-extrabold tracking-tight">
                                    Hello Friend!
                                </h2>
                                <p className="text-sm text-purple-100 font-normal leading-relaxed">
                                    Register with your personal details to use all of site features
                                </p>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => toggleMode(true)}
                                        className="px-10 py-3 rounded-xl border-2 border-white text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-purple-900 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
                                    >
                                        SIGN UP
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="welcome-back"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6 max-w-xs"
                            >
                                <h2 className="text-4xl font-extrabold tracking-tight">
                                    Welcome Back!
                                </h2>
                                <p className="text-sm text-purple-100 font-normal leading-relaxed">
                                    Enter your personal details to use all of site features
                                </p>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => toggleMode(false)}
                                        className="px-10 py-3 rounded-xl border-2 border-white text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-purple-900 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
                                    >
                                        SIGN IN
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default SlidingAuthCard;
