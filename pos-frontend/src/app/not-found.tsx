import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileQuestion className="w-12 h-12" />
                </div>

                <h1 className="text-4xl font-bold text-slate-900">Page Not Found</h1>
                <p className="text-lg text-slate-500">
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <div className="pt-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-105"
                    >
                        <Home className="w-5 h-5" />
                        Go Back Home
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-8 text-slate-400 text-sm font-medium">
                Beer POS System
            </div>
        </div>
    );
}
