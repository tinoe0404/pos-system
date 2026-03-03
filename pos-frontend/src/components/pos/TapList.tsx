'use client';

import React from 'react';
import { useTaps } from '@/hooks/useTaps';
import { Beer, AlertTriangle } from 'lucide-react';

export const TapList: React.FC = () => {
    const { data: taps, isLoading } = useTaps();

    if (isLoading) {
        return (
            <div className="p-4 bg-background-panel rounded-xl border border-border/50 animate-pulse">
                <div className="h-4 w-32 bg-border rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 bg-border/50 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-background-panel rounded-2xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Beer className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-bold text-foreground">Active Taps</h2>
            </div>

            <div className="space-y-4">
                {taps?.map((tap) => {
                    const currentVol = Number(tap.keg?.current_volume || 0);
                    const totalVol = Number(tap.keg?.total_volume || 1);
                    const percentage = Math.round((currentVol / totalVol) * 100);
                    const isLow = percentage < 20;
                    const isEmpty = percentage <= 0;

                    return (
                        <div key={tap.id} className="group transition-all duration-200">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-border text-[10px] font-bold text-foreground-subtle">
                                        {tap.id}
                                    </span>
                                    <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                                        {tap.keg?.product?.name || 'No Keg Assigned'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {isLow && !isEmpty && (
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                    )}
                                    <span className={`text-[11px] font-bold ${isEmpty ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-foreground-subtle'}`}>
                                        {percentage}%
                                    </span>
                                </div>
                            </div>

                            <div className="h-2 w-full bg-border/30 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isEmpty ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}

                {(!taps || taps.length === 0) && (
                    <p className="text-[11px] text-foreground-subtle text-center py-4">
                        No taps configured.
                    </p>
                )}
            </div>
        </div>
    );
};
