'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { LayoutDashboard, Package, Users, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Welcome back, {user?.name || 'Admin'}!
                </h2>
                <p className="text-slate-500">
                    This is your admin dashboard. More features coming soon.
                </p>
            </div>

            {/* Placeholder Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <PlaceholderCard
                    icon={TrendingUp}
                    title="Sales"
                    description="View sales reports"
                    color="blue"
                />
                <PlaceholderCard
                    icon={Package}
                    title="Products"
                    description="Manage inventory"
                    color="green"
                />
                <PlaceholderCard
                    icon={Users}
                    title="Users"
                    description="Manage staff"
                    color="purple"
                />
                <PlaceholderCard
                    icon={LayoutDashboard}
                    title="Analytics"
                    description="View insights"
                    color="orange"
                />
            </div>
        </div>
    );
}

interface PlaceholderCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

function PlaceholderCard({ icon: Icon, title, description, color }: PlaceholderCardProps) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
    );
}
