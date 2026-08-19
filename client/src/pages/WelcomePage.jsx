import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

const WelcomePage = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    navigate('/home');
                }
            });

            tl.fromTo(
                '.gsap-welcome-logo',
                { scale: 0.4, opacity: 0, rotation: -15 },
                { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }
            )
            .fromTo(
                '.gsap-welcome-title',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
                '-=0.2'
            )
            .fromTo(
                '.gsap-welcome-sub',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
                '-=0.2'
            )
            .fromTo(
                '.gsap-welcome-dots span',
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, stagger: 0.1, duration: 0.3 },
                '-=0.2'
            )
            .to(
                containerRef.current,
                { opacity: 0, scale: 1.05, duration: 0.3, ease: 'power2.inOut' },
                '+=0.4'
            );
        }, containerRef);

        return () => ctx.revert();
    }, [navigate]);

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-hidden">
            <div className="relative text-center z-10 p-8 flex flex-col items-center max-w-xl">
                <div className="gsap-welcome-logo mb-6 flex items-center justify-center h-28 w-28 bg-white/10 rounded-3xl border border-white/20">
                    <img src="/logo.png" alt="GP MiniMart Logo" className="h-20 w-20 object-contain" />
                </div>

                <h1 className="gsap-welcome-title text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                    Welcome to GP MiniMart
                </h1>

                <p className="gsap-welcome-sub text-slate-300 text-base md:text-lg font-medium">
                    Your trusted neighbourhood grocery store, now at your fingertips.
                </p>

                <div className="gsap-welcome-dots mt-8 flex space-x-2 justify-center items-center">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
