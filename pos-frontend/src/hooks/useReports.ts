import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface DailyReport {
    date: string;
    totalSales: number;
    totalRevenue: string;
    topProducts: Array<{ name: string; quantity: number; revenue: string }>;
    paymentMethods: Record<string, number>;
    hourlyBreakdown?: Array<{ hour: number; sales: number; revenue: string }>;
}

/**
 * Fetch daily sales report
 */
export const useDailyReport = (date?: string) => {
    return useQuery({
        queryKey: ['reports', 'daily', date],
        queryFn: async () => {
            const params = date ? `?date=${date}` : '';
            const res = await api.get<DailyReport>(`/api/reports/daily${params}`);
            return res.data;
        },
    });
};

/**
 * Download daily report as PDF
 */
export const downloadDailyReportPDF = async (date?: string) => {
    try {
        const params = date ? `?date=${date}` : '';
        const res = await api.get(`/api/reports/daily/pdf${params}`, {
            responseType: 'blob',
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `daily-report-${date || 'today'}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download PDF:', error);
        throw error;
    }
};
