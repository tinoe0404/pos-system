export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-blue-600">
                    BP
                </div>
            </div>
            <p className="text-slate-500 font-medium animate-pulse">Loading System...</p>
        </div>
    );
}
