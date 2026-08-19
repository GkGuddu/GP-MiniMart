import { useState, memo } from 'react';
import { ShoppingBag } from 'lucide-react';

const LazyImage = memo(({ src, alt, className, ...props }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {!loaded && !error && (
                <div className="absolute inset-0 bg-slate-200 animate-pulse rounded-2xl" />
            )}

            {error ? (
                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 rounded-2xl">
                    <ShoppingBag size={32} />
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt || 'Product image'}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
                    {...props}
                />
            )}
        </div>
    );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
