"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AuditData } from "@/app/data/audit-data"
import { fetchAuditData } from "@/app/services/api-service"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

function useAuditData() {
  const [auditData, setAuditData] = useState<AuditData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchAuditData("audit", "");
        setAuditData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching audit data:", err);
        setError("Failed to fetch audit data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { auditData, loading, error };
}

export function AuditDataTable() {
  const router = useRouter();
  const { auditData, loading, error } = useAuditData();
  
  const handleFileClick = (fileName: string, status: string) => {
    // Only navigate if the status is ERROR
    if (status === "ERROR") {
      // Use encodeURIComponent to handle special characters in the file name
      const encodedFileName = encodeURIComponent(fileName);
      console.log(`Navigating to: /error-details/${encodedFileName}`);
      router.push(`/error-details/${encodedFileName}`);
    }
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-green-500">Success</Badge>;
      case "ERROR":
        return <Badge className="bg-red-500">Error</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
        <span className="ml-2">Loading audit data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
        <p>{error}</p>
      </div>
    );
  }

  if (!auditData || auditData.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
        <p className="text-muted-foreground">No audit data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size (MB)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Processed Rows</TableHead>
            <TableHead className="text-right">Error Rows</TableHead>
            <TableHead>Started At</TableHead>
            <TableHead>Finished At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditData.map((audit) => (
            <TableRow key={audit.audit_id}>
              <TableCell>{audit.audit_id}</TableCell>
              <TableCell>
                {audit.file_name}
              </TableCell>
              <TableCell>{audit.file_type}</TableCell>
              <TableCell>{audit.file_size.toFixed(2)}</TableCell>
              <TableCell>{getStatusBadge(audit.status)}</TableCell>
              <TableCell className="text-right">{audit.processed_rows.toLocaleString()}</TableCell>
              <TableCell className="text-right">{audit.error_rows.toLocaleString()}</TableCell>
              <TableCell>{formatDate(audit.started_at)}</TableCell>
              <TableCell>{formatDate(audit.finished_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}