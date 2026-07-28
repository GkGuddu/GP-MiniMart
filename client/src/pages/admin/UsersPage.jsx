import { useState, useEffect, useContext } from 'react';
import { Search, Shield, ShieldOff, UserCheck, UserX } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import AuthContext from '../../context/AuthContext';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user: currentUser } = useContext(AuthContext);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users', error);
            toast.error('Failed to load users');
            setLoading(false);
        }
    };

    const handleBlockUser = async (id, isBlocked) => {
        if (id === currentUser._id) {
            toast.error("You cannot block yourself");
            return;
        }
        try {
            const { data } = await api.put(`/users/${id}/block`);
            setUsers(users.map(u => u._id === id ? { ...u, isBlocked: data.isBlocked } : u));
            toast.success(data.isBlocked ? 'User blocked' : 'User unblocked');
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleRoleChange = async (id, currentRole) => {
        if (id === currentUser._id) {
            toast.error("You cannot change your own role");
            return;
        }
        const newRole = currentRole === 'admin' ? 'client' : 'admin';
        if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            try {
                const { data } = await api.put(`/users/${id}/role`, { role: newRole });
                setUsers(users.map(u => u._id === id ? { ...u, role: data.role } : u));
                toast.success(`User role updated to ${newRole}`);
            } catch (error) {
                toast.error('Failed to update user role');
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-md">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:text-indigo-600 focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="text-center py-10">Loading users...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleRoleChange(user._id, user.role)}
                                                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                                        title="Change Role"
                                                    >
                                                        <Shield size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleBlockUser(user._id, user.isBlocked)}
                                                        className={`p-1 rounded ${user.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                                                        title={user.isBlocked ? "Unblock User" : "Block User"}
                                                    >
                                                        {user.isBlocked ? <UserCheck size={18} /> : <UserX size={18} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersPage;
