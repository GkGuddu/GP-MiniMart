import { useState, useEffect } from 'react';
import { Save, Lock, CreditCard, Truck, Info, Store, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        storeName: 'My Kirana Store',
        email: 'admin@example.com',
        contactNumber: '+91 98765 43210',
        address: 'Local Market, City',
        currency: '₹',
        taxRate: 5,
        shippingCharge: 0,
        freeShippingThreshold: 500,
        siteDescription: '',
        aboutUsSnippet: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('New passwords do not match');
        }

        if (passwordData.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setPasswordLoading(true);
        try {
            await api.put('/users/profile/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (error) {
            console.error('Error changing password', error);
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            if (data) {
                setSettings(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching settings', error);
            toast.error('Failed to load settings');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/settings', settings);
            setSettings(data);
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings', error);
            toast.error('Failed to save settings');
        }
    };

    if (loading) return <div className="text-center py-10">Loading settings...</div>;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 min-w-[100px] py-4 text-sm font-medium text-center transition-colors ${activeTab === 'general' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`flex-1 min-w-[100px] py-4 text-sm font-medium text-center transition-colors ${activeTab === 'about' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        About & SEO
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 min-w-[100px] py-4 text-sm font-medium text-center transition-colors ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Security
                    </button>
                    <button
                        onClick={() => setActiveTab('payment')}
                        className={`flex-1 min-w-[100px] py-4 text-sm font-medium text-center transition-colors ${activeTab === 'payment' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Payments
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {(activeTab === 'general' || activeTab === 'about') && (
                        <form onSubmit={handleSave} className="space-y-6">
                            {activeTab === 'general' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center text-gray-800"><Store className="mr-2" size={20} /> Store Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Store Name</label>
                                            <input type="text" name="storeName" value={settings.storeName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                                            <input type="email" name="email" value={settings.email} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                            <input type="text" name="contactNumber" value={settings.contactNumber} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Currency Symbol</label>
                                            <input type="text" name="currency" value={settings.currency} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <textarea name="address" rows="2" value={settings.address} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"></textarea>
                                    </div>

                                    <h3 className="text-lg font-semibold flex items-center text-gray-800 pt-4"><Truck className="mr-2" size={20} /> Shipping & Tax</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Shipping Charge</label>
                                            <input type="number" name="shippingCharge" value={settings.shippingCharge} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Free Shipping Threshold</label>
                                            <input type="number" name="freeShippingThreshold" value={settings.freeShippingThreshold} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                                            <input type="number" name="taxRate" value={settings.taxRate} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'about' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center text-gray-800"><Info className="mr-2" size={20} /> About & Site Info</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">About Us Snippet (Footer)</label>
                                        <p className="text-xs text-gray-500 mb-1">A short description appearing in the website footer.</p>
                                        <textarea name="aboutUsSnippet" rows="3" value={settings.aboutUsSnippet} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Site Description (SEO)</label>
                                        <p className="text-xs text-gray-500 mb-1">Used for meta tags and search engines.</p>
                                        <textarea name="siteDescription" rows="3" value={settings.siteDescription} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"></textarea>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
                                <button type="submit" className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30">
                                    <Save size={18} className="mr-2" /> Save Settings
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md animate-fade-in">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center text-gray-800 mb-1">
                                    <Lock className="mr-2 text-indigo-600" size={20} /> Change Password
                                </h3>
                                <p className="text-xs text-gray-500 mb-6">Update your account login password below.</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="block w-full rounded-md border-gray-300 shadow-sm border p-2.5 pr-10 text-gray-955 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600 focus:outline-none"
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="block w-full rounded-md border-gray-300 shadow-sm border p-2.5 pr-10 text-gray-955 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600 focus:outline-none"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="block w-full rounded-md border-gray-300 shadow-sm border p-2.5 pr-10 text-gray-955 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600 focus:outline-none"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="w-full flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 disabled:opacity-50 font-medium"
                                    >
                                        {passwordLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'payment' && (
                        <div className="text-center py-10 text-gray-500 animate-fade-in">
                            <CreditCard size={48} className="mx-auto text-gray-300 mb-4 animate-pulse" />
                            <p>Payment Gateway configuration (Coming Soon)</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
