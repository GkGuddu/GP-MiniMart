import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage = () => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success('Message sent successfully! We will get back to you soon.');
            e.target.reset();
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Contact Us</h1>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                Have a question or feedback? We'd love to hear from you. Reach out to us via phone, email, or visit our store.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Info & Map */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="bg-indigo-100 p-3 rounded-lg text-primary mr-4">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Store Address</h3>
                                    <p className="text-gray-600 mt-1">Indrapuri, GP MiniMart,<br />Bhopal, India 462022</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="bg-indigo-100 p-3 rounded-lg text-primary mr-4">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Phone Number</h3>
                                    <p className="text-gray-600 mt-1">+91-7367850872</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="bg-indigo-100 p-3 rounded-lg text-primary mr-4">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Email Address</h3>
                                    <p className="text-gray-600 mt-1">support@GPminimart
                                        .com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 rounded-2xl overflow-hidden h-64 border border-gray-200 shadow-inner">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3666.0!2d77.4!3d23.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDEyJzAwLjAiTiA3N8KwMjQnMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            title="Store Location"
                        ></iframe>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Order Inquiry"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea
                                required
                                rows="5"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                placeholder="How can we help you?"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : <><Send size={20} className="mr-2" /> Send Message</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
