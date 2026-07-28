import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import BackToTop from './BackToTop';
import AIAssistant from './AIAssistant';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
    return (
        <div className="min-h-screen font-sans flex flex-col">
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            <WhatsAppButton />
            <AIAssistant />
            <BackToTop />
            <Navbar />
            <main className="container mx-auto px-4 py-8 pt-24 flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
