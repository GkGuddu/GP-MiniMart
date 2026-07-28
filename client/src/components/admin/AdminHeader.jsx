import { Menu, Search, Bell, User } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const AdminHeader = ({ setIsSidebarOpen }) => {
    const { user } = useContext(AuthContext);

    return (
        <header className="h-16 glass border-b border-white/20 flex items-center justify-between px-4 sticky top-0 z-10 lg:pl-6">
            <div className="flex items-center">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 mr-2 md:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                >
                    <Menu size={24} />
                </button>

                {/* Search Bar */}
                <div className="hidden md:flex relative text-gray-400 focus-within:text-gray-600">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} />
                    </div>
                    <input
                        name="search"
                        id="search"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                        placeholder="Search..."
                        type="search"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-gray-500">Super Admin</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
