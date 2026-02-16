'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface SalesChartProps {
    data: {
        cash: number;
        ecocash: number;
    };
}

const COLORS = ['#22c55e', '#6366f1'];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name: string; fill: string } }> }) {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
        <div className="bg-background-tertiary border border-card-border rounded-lg px-3 py-2 shadow-lg">
            <p className="text-xs text-foreground-muted mb-0.5">{item.payload.name}</p>
            <p className="text-sm font-bold text-foreground">${item.value?.toFixed(2) ?? '0.00'}</p>
        </div>
    );
}

export default function SalesChart({ data }: SalesChartProps) {
    const chartData = [
        { name: 'Cash', amount: data.cash, fill: COLORS[0] },
        { name: 'EcoCash', amount: data.ecocash, fill: COLORS[1] },
    ];

    const maxVal = Math.max(data.cash, data.ecocash, 1);

    return (
        <div className="space-y-4">
            {/* Visual bars */}
            <div className="space-y-3">
                {chartData.map((item, i) => (
                    <div key={item.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                <span className="text-foreground-muted">{item.name}</span>
                            </div>
                            <span className="font-bold text-foreground">${item.amount.toFixed(2)}</span>
                        </div>
                        <div className="h-3 bg-background-tertiary rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${Math.max((item.amount / maxVal) * 100, 2)}%`,
                                    backgroundColor: item.fill,
                                    opacity: 0.85,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(35,35,58,0.6)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#8888a0', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#8888a0', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                        <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={48}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
