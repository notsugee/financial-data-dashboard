import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportPDFOptions {
  title?: string;
  filename?: string;
  pageSize?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
}

/**
 * Exports a DOM element as a PDF file
 * @param element The DOM element to export
 * @param options Export options
 */
export async function exportToPDF(
  element: HTMLElement,
  options: ExportPDFOptions = {}
) {
  try {
    const {
      title = 'Audit Monitor Dashboard',
      filename = 'audit-monitor-report',
      pageSize = 'a4',
      orientation = 'landscape',
    } = options;

    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize,
    });

    // Add the title
    const pageWidth = pdf.internal.pageSize.getWidth();
    pdf.setFontSize(18);
    pdf.text(title, pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(12);

    // Get the canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow loading of cross-origin images
      logging: false,
    });

    // Calculate the dimensions to fit the page
    const imgWidth = pageWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add the image to the PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight);

    // Add a footer with date
    const today = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    pdf.text(`Generated on ${today}`, 10, pdf.internal.pageSize.getHeight() - 10);

    // Save the PDF
    pdf.save(`${filename}.pdf`);

    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
}

/**
 * Exports specific visualizations as a PDF
 * @param containerSelector The CSS selector for the container to export
 * @param options Export options
 */
export function exportVisualizationsToPDF(
  containerSelector: string = '#visualizations-container',
  options: ExportPDFOptions = {}
) {
  const container = document.querySelector(containerSelector) as HTMLElement;

  if (!container) {
    console.error(`Container not found: ${containerSelector}`);
    return false;
  }

  return exportToPDF(container, {
    title: 'Audit Monitor Visualizations',
    filename: 'audit-visualizations',
    ...options,
  });
}