import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, Sparkles } from 'lucide-react';
import api from '../utils/api';

const renderMessageText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <div key={lineIdx} className={lineIdx > 0 ? 'mt-1.5' : ''}>
                {parts.map((part, partIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={partIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
            </div>
        );
    });
};

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your GP MiniMart AI Assistant. How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
        setIsTyping(true);

        try {
            const { data } = await api.post('/ai/chat', { message: userMsg });
            setMessages(prev => [...prev, { text: data.text, isBot: true }]);
        } catch (error) {
            console.error('AI chat failed:', error);
            setMessages(prev => [...prev, { text: "🤖 **Network Error**\nI'm having trouble connecting to my server brain right now. Please check your connection and try again.", isBot: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-[104px] right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden"
                        style={{ height: '450px' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex justify-between items-center text-white shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <Bot size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-wide">GP MiniMart AI</h3>
                                    <p className="text-xs text-indigo-100 mt-0.5 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 px-0 shadow-[0_0_5px_rgba(74,222,128,0.8)]"></span>
                                        Online | Replies instantly
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors flex my-auto h-fit">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-2 ${msg.isBot ? 'items-start' : 'items-end flex-row-reverse'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isBot ? 'bg-indigo-100 text-indigo-600' : 'bg-primary text-white shadow-md'}`}>
                                        {msg.isBot ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className={`p-3 rounded-2xl max-w-[75%] text-sm ${msg.isBot ? 'bg-white border border-gray-100 shadow-sm rounded-tl-none text-gray-700' : 'bg-primary text-white shadow-md rounded-tr-none'}`}>
                                        {msg.isBot ? renderMessageText(msg.text) : msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-2 items-start">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <Bot size={16} />
                                    </div>
                                    <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none flex gap-1 items-center">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border border-transparent focus:border-indigo-300"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="w-10 h-10 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-full flex items-center justify-center hover:from-primary-dark hover:to-indigo-700 transition-colors disabled:opacity-50 shadow-md"
                            >
                                <Send size={16} className="ml-1" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-[104px] right-6 z-40 bg-gradient-to-r from-indigo-500 to-violet-600 text-white p-4 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] transition-all flex items-center justify-center peer group"
                    aria-label="Open AI Assistant"
                >
                    <Sparkles size={16} className="absolute top-1.5 right-1.5 text-yellow-300 animate-pulse" />
                    <Bot size={28} />

                    {/* Tooltip */}
                    <span className="absolute right-full mr-4 bg-gray-900 font-medium text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Ask AI Assistant
                        <div className="absolute top-1/2 -right-1 w-2 h-2 bg-gray-900 transform -translate-y-1/2 rotate-45" />
                    </span>
                </motion.button>
            )}
        </>
    );
};

export default AIAssistant;
