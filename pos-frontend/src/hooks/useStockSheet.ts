import api from '@/lib/api';

/**
 * Download daily stock sheet as PDF
 * Works on both desktop and mobile devices
 */
export const downloadStockSheetPDF = async (date?: string) => {
    try {
        const params = date ? `?date=${date}` : '';
        const res = await api.get(`/api/reports/stock-sheet/pdf${params}`, {
            responseType: 'blob',
        });

        const blob = new Blob([res.data], { type: 'application/pdf' });
        const filename = `daily-stock-sheet-${date || new Date().toISOString().split('T')[0]}.pdf`;

        // Try using Web Share API for mobile devices (native share sheet)
        if (typeof navigator !== 'undefined' && navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
            try {
                const file = new File([blob], filename, { type: 'application/pdf' });
                await navigator.share({
                    files: [file],
                    title: 'Daily Stock Sheet',
                });
                return;
            } catch {
                // Share was cancelled or not supported, fall through to link download
            }
        }

        // Standard download approach (works on desktop + most mobile browsers)
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        // Setting target for mobile Safari compatibility
        link.setAttribute('target', '_blank');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        // Delay cleanup to allow mobile browsers time to start the download
        setTimeout(() => {
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        }, 1000);
    } catch (error) {
        console.error('Failed to download stock sheet PDF:', error);
        throw error;
    }
};
