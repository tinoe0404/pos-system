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
        <div className="bg-card rounded-xl border border-card-border p-5 hover:border-border-hover transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="text-xs font-medium text-foreground-muted mb-1">{title}</p>
                    {isLoading ? (
                        <div className="h-8 w-28 skeleton" />
                    ) : (
                        <h3 className="text-2xl font-bold text-foreground">
                            {prefix}
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </h3>
                    )}
                    {subtitle && !isLoading && (
                        <p className="text-[11px] text-foreground-subtle mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-2.5 rounded-lg ${gradient}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            {isLoading && (
                <div className="h-1.5 w-full bg-background-tertiary rounded-full overflow-hidden">
                    <div className="h-full w-1/2 skeleton" />
                </div>
            )}
        </div>
    );
}
