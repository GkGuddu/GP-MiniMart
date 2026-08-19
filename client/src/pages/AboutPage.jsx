import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Heart, Users } from 'lucide-react';
import api from '../utils/api';

const AboutPage = () => {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setSettings(data);
            } catch (error) {
                console.error('Error loading settings', error);
            }
        };
        fetchSettings();
    }, []);

    const storeName = settings?.storeName || 'SwiftCart';
    const mission = settings?.aboutUsSnippet || 'bringing the traditional warmth of your local Kirana store to the digital age.';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                >
                    About <span className="text-primary">{storeName}</span>
                </motion.h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    {settings?.siteDescription || `Bringing the traditional warmth of your local Kirana store to the digital age.
                    We are on a mission to deliver freshness to every doorstep in Bhopal.`}
                </p>
            </div>

            {/* Our Story */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                <div className="relative rounded-2xl overflow-hidden shadow-lg h-[400px]">
                    <img
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                        alt="Grocery Store"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <div className="text-white">
                            <p className="font-bold text-xl">Est. 2026</p>
                            <p>Serving our community with pride</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        It all started with a simple idea: why should getting high-quality daily essentials be difficult?
                        In 2026, we launched {storeName} to bridge the gap between local farmers/distributors and your kitchen.
                    </p>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        We realized that while technology moves fast, the need for fresh, quality ingredients remains constant.
                        By combining modern logistics with the trust of a local grocer, we've created a shopping experience that is both fast and reliable.
                    </p>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="bg-indigo-50 rounded-3xl p-8 md:p-12 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-2xl font-bold text-primary mb-4 flex items-center">
                            <ShieldCheck className="mr-3" /> Our Mission
                        </h3>
                        <p className="text-gray-700 text-lg">
                            To provide every household with access to the freshest, highest quality groceries at fair prices,
                            delivered with speed and care.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-primary mb-4 flex items-center">
                            <Heart className="mr-3" /> Our Vision
                        </h3>
                        <p className="text-gray-700 text-lg">
                            To become the most trusted neighborhood grocery service, known not just for our products,
                            but for the relationships we build with our community.
                        </p>
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {[
                    { icon: <Truck size={40} />, title: "Speed", desc: "We value your time. Our logistics network ensures orders reach you in minutes." },
                    { icon: <ShieldCheck size={40} />, title: "Quality", desc: "No compromises. Every item is quality checked before it leaves our store." },
                    { icon: <Users size={40} />, title: "Community", desc: "We are more than a store. We are a part of your daily life and community." }
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
                    >
                        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-primary mb-6">
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                        <p className="text-gray-600">{item.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Service Area */}
            <div className="text-center bg-gray-900 text-white rounded-3xl p-12">
                <h2 className="text-3xl font-bold mb-4">We are currently delivering!</h2>
                <p className="text-xl text-gray-400 mb-8">Serving {settings?.address || 'Indrapuri, Piplani, and surrounding areas in Bhopal'}.</p>
                <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-indigo-300 border border-white/20">
                    ZIP Codes: 462021, 462022, 462023
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
