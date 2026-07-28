import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to the home page after 3 seconds
        const timer = setTimeout(() => {
            navigate('/home');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 overflow-hidden">
            {/* Background animated gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/30 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>

            <div className="relative text-center z-10 p-8 flex flex-col items-center">
                {/* Logo or Icon */}
                <div className="mb-8 relative animate-bounce flex items-center justify-center h-24 w-24 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <img src="/logo.png" alt="GP MiniMart Logo" className="h-16 w-16 object-contain" />
                </div>

                {/* Text Animation */}
                <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4 animate-fade-in-up">
                    Welcome to GP MiniMart
                </h1>

                <p className="text-slate-300 text-lg md:text-xl font-medium max-w-lg mx-auto opacity-0 animate-fade-in-up delay-500">
                    Your premium destination for everyday groceries and essentials.
                </p>

                {/* Loading indicator */}
                <div className="mt-12 flex space-x-2 justify-center opacity-0 animate-fade-in-up delay-700">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
