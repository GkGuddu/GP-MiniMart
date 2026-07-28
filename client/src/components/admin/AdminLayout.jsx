import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content Wrapper */}
            <div className="flex-1 min-w-0 flex flex-col md:pl-64 transition-all duration-300">
                {/* Header */}
                <AdminHeader setIsSidebarOpen={setIsSidebarOpen} />

                {/* Page Content */}
                <main className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
