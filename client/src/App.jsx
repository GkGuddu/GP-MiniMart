import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/admin/AdminLayout';
import DashboardHome from './pages/admin/DashboardHome';
import ProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';

import UsersPage from './pages/admin/UsersPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import BackToTop from './components/BackToTop';

import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

import BackgroundAnimation from './components/BackgroundAnimation';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import WelcomePage from './pages/WelcomePage';

function App() {
  return (
    <>
      <BackgroundAnimation />
      <Routes>
        {/* Public Routes without Layout */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/resetpassword/:resetToken" element={<ResetPasswordPage />} />

        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Protected Customer Routes (still use MainLayout) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/myorders" element={<MyOrdersPage />} />
          </Route>
        </Route>

        {/* Admin Routes (Standalone Layout) */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/edit/:id" element={<ProductFormPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

// Wrapper to handle Router context and Google OAuth Provider
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '443830056702-bmk5f5c214pl2tg93t8lmr3s58pve1al.apps.googleusercontent.com';

const AppWithRouter = () => (
  <GoogleOAuthProvider clientId={googleClientId}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);

export default AppWithRouter;
