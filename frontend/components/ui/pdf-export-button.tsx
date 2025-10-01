"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface PDFExportButtonProps extends React.ComponentProps<typeof Button> {
  targetElementId?: string; // Now optional as we'll use the browser print
  title?: string;
  filename?: string;
  orientation?: "portrait" | "landscape";
  children?: React.ReactNode;
}

export function PDFExportButton({
  targetElementId,
  title = "Audit Monitor Dashboard",
  filename,
  orientation = "landscape",
  children = "Export as PDF",
  ...props
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  // This effect ensures we clean up print classes if user cancels the print dialog
  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-pdf');
      document.body.removeAttribute('data-print-title');
      document.body.removeAttribute('data-print-date');
      setIsExporting(false);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handleExportPDF = () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      // Prepare the document for printing
      const originalTitle = document.title;
      
      // Set document title to the requested title or filename
      if (title) {
        document.title = title;
      }
      
      // Add print-specific attributes to body
      document.body.classList.add('printing-pdf');
      document.body.setAttribute('data-print-title', title);
      document.body.setAttribute('data-print-date', new Date().toLocaleDateString());
      
      // Use built-in browser print functionality
      // This works better than any JS library for PDF generation
      setTimeout(() => {
        window.print();
        
        // The afterprint event will handle cleanup, but add a fallback
        setTimeout(() => {
          document.title = originalTitle;
          document.body.classList.remove('printing-pdf');
          document.body.removeAttribute('data-print-title');
          document.body.removeAttribute('data-print-date');
          setIsExporting(false);
        }, 1000);
      }, 200);
    } catch (error) {
      console.error("Error printing to PDF:", error);
      alert("Failed to export PDF. Please try again.");
      document.body.classList.remove('printing-pdf');
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2 print-hidden"
      onClick={handleExportPDF}
      disabled={isExporting}
      {...props}
    >
      <Printer className="h-4 w-4" />
      {isExporting ? "Preparing PDF..." : children}
    </Button>
  );
}