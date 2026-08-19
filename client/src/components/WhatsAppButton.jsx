import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
    const phoneNumber = "+91-7367850872"; // Updated number
    const message = "Hi, I would like to order from your MiniMart.";

    const handleClick = () => {
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 flex items-center justify-center animate-bounce-slow"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={32} fill="white" />
        </button>
    );
};

export default WhatsAppButton;
