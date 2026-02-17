import api from '@/lib/api';

/**
 * Download daily stock sheet as PDF
 */
export const downloadStockSheetPDF = async (date?: string) => {
    try {
        const params = date ? `?date=${date}` : '';
        const res = await api.get(`/api/reports/stock-sheet/pdf${params}`, {
            responseType: 'blob',
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `daily-stock-sheet-${date || new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download stock sheet PDF:', error);
        throw error;
    }
};
