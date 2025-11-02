import { apiRequest } from '@/utils/api';

/**
 * Export session results to Excel file
 * Downloads a .xlsx file with all session scores and statistics
 */
export const exportSessionToExcel = async (sessionId: string): Promise<Blob> => {
  const response = await apiRequest(`/api/v1/session-scores/session/${sessionId}/export`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error ${response.status}: ${errorText || 'Error al exportar resultados'}`
    );
  }

  // Return the blob for download
  return await response.blob();
};

/**
 * Helper function to trigger file download in the browser
 */
export const downloadExcelFile = (blob: Blob, sessionId: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `resultados-sesion-${sessionId}-${Date.now()}.xlsx`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
