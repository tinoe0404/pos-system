import { Store, Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
            <div className="w-12 h-12 bg-primary-muted text-primary rounded-2xl flex items-center justify-center border border-card-border">
                <Store className="w-6 h-6" />
            </div>
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
            <p className="text-foreground-muted text-sm font-medium">Loading...</p>
        </div>
    );
}
