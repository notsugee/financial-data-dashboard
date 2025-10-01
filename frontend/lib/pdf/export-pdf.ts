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
      scale: 1.5, // Balance between quality and file size for large pages
      useCORS: true, // Allow loading of cross-origin images
      allowTaint: true, // Allow tainted canvas to capture all content
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    // Calculate the dimensions to fit the page
    const imgWidth = pageWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add the image to the PDF with multi-page support for large content
    const imgData = canvas.toDataURL('image/png');
    
    // Get available height for content (accounting for margins)
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentMaxHeight = pageHeight - 35; // 25 top margin + 10 bottom margin
    
    // Handle multi-page content
    if (imgHeight <= contentMaxHeight) {
      // Content fits on one page
      pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight);
    } else {
      // Content needs multiple pages
      let heightLeft = imgHeight;
      let position = 25; // Starting position
      let page = 1;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= contentMaxHeight;
      
      // Add subsequent pages as needed
      while (heightLeft > 0) {
        position = 15; // Top margin for subsequent pages
        pdf.addPage();
        page++;
        
        // Position is negative to push the image up (showing the part that was cut off)
        pdf.addImage(imgData, 'PNG', 10, position - (page * contentMaxHeight - 10), imgWidth, imgHeight);
        heightLeft -= contentMaxHeight;
      }
    }

    // Add a footer with date on the last page
    const today = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    pdf.text(`Generated on ${today}`, 10, pageHeight - 10);

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