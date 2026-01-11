'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface SalesChartProps {
    data: {
        cash: number;
        ecocash: number;
    };
}

export default function SalesChart({ data }: SalesChartProps) {
    const chartData = [
        {
            name: 'Cash',
            amount: data.cash,
            fill: '#3b82f6', // blue-500
        },
        {
            name: 'EcoCash',
            amount: data.ecocash,
            fill: '#10b981', // emerald-500
        },
    ];

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        formatter={(value: number | undefined) => [
                            `$${value?.toFixed(2) ?? '0.00'}`,
                            'Revenue',
                        ]}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Bar
                        dataKey="amount"
                        radius={[4, 4, 0, 0]}
                        barSize={60}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
