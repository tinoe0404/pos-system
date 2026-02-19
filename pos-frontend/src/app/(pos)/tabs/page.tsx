'use client';

import TabsPanel from '@/components/pos/TabsPanel';
import { useRouter } from 'next/navigation';

export default function TabsPage() {
    const router = useRouter();
    return (
        <div className="h-full bg-background-secondary p-4 pt-14 md:pt-4">
            <div className="h-full rounded-2xl overflow-hidden border border-card-border shadow-sm">
                <TabsPanel onClose={() => router.push('/pos')} />
            </div>
        </div>
    );
}
