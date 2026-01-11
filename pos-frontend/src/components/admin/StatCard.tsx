import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    gradient: string;
    isLoading?: boolean;
    prefix?: string;
    subtitle?: string;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    gradient,
    isLoading = false,
    prefix = '',
    subtitle,
}: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    {isLoading ? (
                        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
                    ) : (
                        <h3 className="text-3xl font-bold text-slate-900">
                            {prefix}
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </h3>
                    )}
                    {subtitle && !isLoading && (
                        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${gradient} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>

            {isLoading && (
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-slate-200 to-slate-300 animate-pulse" />
                </div>
            )}
        </div>
    );
}
