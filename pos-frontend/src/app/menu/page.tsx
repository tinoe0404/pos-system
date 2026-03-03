'use client';

import React, { useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useTaps } from '@/hooks/useTaps';
import { Beer, Info, Droplets, Wind, Zap, Navigation } from 'lucide-react';

export default function CustomerMenu() {
    const { data: productData, isLoading: productsLoading } = useProducts();
    const { data: taps, isLoading: tapsLoading } = useTaps();

    const isLoading = productsLoading || tapsLoading;

    const tapItems = useMemo(() => {
        if (!taps || !productData?.products) return [];
        return taps
            .filter(tap => tap.is_active && tap.keg)
            .map(tap => {
                const product = productData.products.find(p => p.id === tap.keg?.product_id);
                return {
                    ...tap,
                    product
                };
            });
    }, [taps, productData?.products]);

    const otherItems = useMemo(() => {
        if (!productData?.products) return [];
        return productData.products.filter(p => !p.is_tap_item && p.active);
    }, [productData?.products]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-6">
                <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-amber-500/80 font-medium tracking-widest uppercase text-sm animate-pulse">
                    Pouring the menu...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
            {/* Header */}
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4 ring-1 ring-amber-500/50 ring-offset-4 ring-offset-black">
                    <Beer className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 uppercase italic">
                    Live Tap <span className="text-amber-500">List</span>
                </h1>
                <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
                    Antigravity Brewing Co. • Established 2026
                </p>
            </div>

            {/* Tap Section */}
            <section className="mb-20">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-3">
                        <Droplets className="w-5 h-5 text-amber-500" />
                        On Tap Now
                    </h2>
                    <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded-full font-bold uppercase">
                        Real-time
                    </span>
                </div>

                <div className="space-y-12">
                    {tapItems.map((tap, index) => {
                        const currentVol = Number(tap.keg?.current_volume || 0);
                        const totalVol = Number(tap.keg?.total_volume || 1);
                        const percentage = Math.round((currentVol / totalVol) * 100);

                        return (
                            <div key={tap.id} className="relative group">
                                <div className="absolute -left-12 top-0 text-white/5 text-6xl font-black italic select-none">
                                    0{tap.id}
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black uppercase italic tracking-tight group-hover:text-amber-500 transition-colors">
                                            {tap.product?.name || 'Beer Name'}
                                        </h3>
                                        <p className="text-amber-500 font-bold text-sm tracking-widest uppercase">
                                            {tap.product?.style || 'Style'} • {tap.product?.brewery || 'Brewery'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-white italic">
                                            ${Number(tap.product?.price || 0).toFixed(2)}
                                        </div>
                                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter mt-1">
                                            {tap.product?.unit_volume ? `${tap.product.unit_volume}ml pour` : 'Pint'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">ABV</div>
                                        <div className="text-lg font-black">{tap.product?.abv || '0.0'}%</div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">IBU</div>
                                        <div className="text-lg font-black">{tap.product?.ibu || '0'}</div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Tap</div>
                                        <div className="text-lg font-black">#{tap.id}</div>
                                    </div>
                                </div>

                                {/* Keg Level Meter */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                        <span className="text-gray-500">Keg Level</span>
                                        <span className={percentage < 20 ? 'text-amber-500 animate-pulse' : 'text-gray-400'}>
                                            {percentage}% Remaining
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out rounded-full ${percentage < 20 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-white/40'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Other Drinks Section */}
            <section>
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-3">
                        <Wind className="w-5 h-5 text-blue-500" />
                        Cans & Bottles
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {otherItems.map((item) => (
                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h4 className="font-bold uppercase tracking-tight group-hover:text-amber-500 transition-colors">
                                        {item.name}
                                    </h4>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                                        {item.category}
                                    </p>
                                </div>
                                <div className="text-lg font-black">
                                    ${Number(item.price).toFixed(2)}
                                </div>
                            </div>
                            {item.abv && (
                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400">
                                    <Zap className="w-3 h-3 text-amber-500" />
                                    {item.abv}% ABV
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-24 pt-12 border-t border-white/10 text-center space-y-6">
                <div className="flex justify-center gap-8">
                    <div className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors cursor-pointer">
                        <Navigation className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">Find Us</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors cursor-pointer">
                        <Info className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">About</span>
                    </div>
                </div>
                <p className="text-[10px] text-gray-600 font-medium uppercase tracking-[0.2em]">
                    Powered by Antigravity POS • v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
                </p>
            </footer>
        </div>
    );
}
