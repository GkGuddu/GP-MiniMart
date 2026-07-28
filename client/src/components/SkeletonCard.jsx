const SkeletonCard = () => {
    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse">
            <div className="h-48 bg-gray-200 rounded-xl mb-4 w-full"></div>
            <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
