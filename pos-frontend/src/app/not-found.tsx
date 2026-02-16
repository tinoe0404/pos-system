import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 bg-background-tertiary text-foreground-subtle rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileQuestion className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-bold text-foreground text-balance">Page Not Found</h1>
                <p className="text-foreground-muted leading-relaxed">
                    The page you are looking for does not exist or has been moved.
                </p>

                <div className="pt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                    >
                        <Home className="w-4 h-4" />
                        Go Back Home
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-8 text-foreground-subtle text-xs font-medium">
                RetailPOS System
            </div>
        </div>
    );
}
