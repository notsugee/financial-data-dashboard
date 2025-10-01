"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function PrintInstructionsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Print in Color</DialogTitle>
          <DialogDescription>
            Follow these steps to export a color PDF:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid gap-2">
            <div className="font-medium">1. Select the PDF printer</div>
            <div className="text-sm text-muted-foreground">
              When the print dialog opens, select "Save as PDF" or "Microsoft Print to PDF" as your printer.
            </div>
          </div>
          
          <div className="grid gap-2">
            <div className="font-medium">2. Enable color printing</div>
            <div className="text-sm text-muted-foreground">
              Look for "More settings" or "Advanced" and make sure "Color" is selected instead of "Black and white".
            </div>
          </div>
          
          <div className="grid gap-2">
            <div className="font-medium">3. Set layout to Landscape</div>
            <div className="text-sm text-muted-foreground">
              For best results, set the layout to "Landscape" orientation.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}