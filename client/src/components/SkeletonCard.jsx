import { memo } from 'react';

const SkeletonCard = memo(() => {
    return (
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm animate-pulse flex flex-col justify-between h-[320px]">
            <div className="h-40 bg-slate-200 rounded-2xl w-full mb-3" />
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <div className="h-3 bg-slate-200 rounded-md w-1/4" />
                    <div className="h-3 bg-slate-200 rounded-md w-1/5" />
                </div>
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                <div className="flex justify-between items-end pt-2">
                    <div className="h-6 bg-slate-200 rounded-md w-1/3" />
                    <div className="h-9 bg-slate-200 rounded-xl w-20" />
                </div>
            </div>
        </div>
    );
});

SkeletonCard.displayName = 'SkeletonCard';

export default SkeletonCard;
