import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart2,
    Settings,
    LogOut,
    Layers,
    Menu,
    X,
    Store
} from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const menuItems = [
        { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/products', name: 'Products', icon: Package },
        { path: '/admin/categories', name: 'Categories', icon: Layers },
        { path: '/admin/orders', name: 'Orders', icon: ShoppingCart },
        { path: '/admin/users', name: 'Users', icon: Users },
        { path: '/admin/reports', name: 'Reports', icon: BarChart2 },
        { path: '/admin/settings', name: 'Settings', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
            <Link
                to={item.path}
                onClick={() => {
                    if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`flex items-center px-6 py-3 mb-[5px] text-sm font-medium transition-all duration-200 border-l-4 ${isActive
                    ? 'border-green-500 bg-slate-800 text-white shadow-lg'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
            >
                <Icon size={20} className={`mr-3 ${isActive ? 'text-green-400' : ''}`} />
                <span>{item.name}</span>
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`fixed top-0 left-0 h-full z-30 w-64 bg-slate-900/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Logo Area */}
                <div className="flex items-center justify-between h-16 px-6 bg-slate-950/50 border-b border-slate-800">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src="/logo.png" alt="SwiftCart" className="h-10 w-auto" />
                        <span className="text-xl font-bold text-white tracking-wide">
                            SwiftCart <span className="text-emerald-500 text-xs uppercase tracking-wider block -mt-1">Admin Panel</span>
                        </span>
                    </Link>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="mt-6 flex-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavItem key={item.path} item={item} />
                    ))}

                    {/* Logout Button */}
                    <div className="mt-8 px-6">
                        <Link
                            to="/home"
                            className="flex items-center w-full px-4 py-3 mb-2 text-sm font-medium text-blue-400 transition-colors rounded-lg hover:bg-slate-800/50 hover:text-blue-300 border border-transparent hover:border-blue-900/30"
                        >
                            <Store size={20} className="mr-3" />
                            <span>Back to Shop</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 transition-colors rounded-lg hover:bg-slate-800/50 hover:text-red-300 border border-transparent hover:border-red-900/30"
                        >
                            <LogOut size={20} className="mr-3" />
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>

                {/* User Info (Bottom) */}
                <div className="absolute bottom-0 w-full p-6 border-t border-slate-800 bg-slate-950/30">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border-2 border-slate-600">
                            AD
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">Administrator</p>
                            <p className="text-xs text-slate-500">admin@store.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
