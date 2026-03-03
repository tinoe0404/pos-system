import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Live Beer Menu | Antigravity Beer POS',
    description: 'Real-time tap list and menu.',
};

export default function MenuLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
            {children}
        </div>
    );
}
