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
 * Fetch today's report summary (used by dashboard for payment breakdown chart)
 */
interface ReportSummary {
    paymentBreakdown: {
        cash: number;
        ecocash: number;
    };
}

export const useReports = () => {
    return useQuery<ReportSummary>({
        queryKey: ['reports', 'summary'],
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];
            const res = await api.get(`/api/reports/daily?date=${today}`);
            const data = res.data as Record<string, unknown>;
            // The backend returns paymentMethodBreakdown with string values
            const breakdown = (data.paymentMethodBreakdown || {}) as Record<string, string>;
            return {
                paymentBreakdown: {
                    cash: parseFloat(breakdown.cash || '0'),
                    ecocash: parseFloat(breakdown.ecocash || '0'),
                },
            };
        },
        staleTime: 60000,
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

export const downloadWeeklyReportPDF = async () => {
    try {
        const res = await api.get(`/api/reports/weekly/pdf`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'weekly-report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download Weekly PDF:', error);
        throw error;
    }
};

export const downloadMonthlyReportPDF = async () => {
    try {
        const res = await api.get(`/api/reports/monthly/pdf`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'monthly-report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download Monthly PDF:', error);
        throw error;
    }
};

