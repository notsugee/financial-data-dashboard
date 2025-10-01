"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AuditDataTable } from "@/components/audit-data-table"
import {
  AuditSummaryCards,
  StatusChart, 
  FileTypeChart, 
  ProcessingTimeChart, 
  ErrorRateChart 
} from "@/components/audit-charts"
import { PDFExportButton } from "@/components/ui/pdf-export-button"
import { AuditErrorsTable } from "@/components/audit-errors-table"

export default function MonitorPage() {
  // Handle print-specific behavior
  React.useEffect(() => {
    const handleBeforePrint = () => {
      // Any additional print preparations if needed
      console.log('Preparing for print');
    };
    
    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, []);
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4">
            <div id="monitor-full-content" className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <p className="text-muted-foreground">
                    Track file processing status, error rates, and audit information
                  </p>
                </div>
                
                <PDFExportButton
                  targetElementId="monitor-full-content"
                  title="Audit Monitor Dashboard"
                  filename={`audit-report-${new Date().toISOString().split('T')[0]}`}
                  orientation="landscape"
                  className="self-start"
                />
              </div>
              
              <div id="visualizations-container" className="space-y-6">
                <AuditSummaryCards />
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <StatusChart />
                  <FileTypeChart />
                  <ProcessingTimeChart />
                  <ErrorRateChart />
                </div>
              </div>
              
              <div className="rounded-md">
                <Card>
                  <CardHeader>
                    <CardTitle>File Processing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AuditDataTable />
                  </CardContent>
                </Card>
              </div>
              
              {/* Add the Audit Errors Table */}
              <div className="rounded-md">
                <AuditErrorsTable />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}