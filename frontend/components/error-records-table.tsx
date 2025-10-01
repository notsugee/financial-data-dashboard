"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchFileErrors } from "@/app/services/api-service"
import { Spinner } from "@/components/ui/spinner"

interface ErrorRecordsTableProps {
  fileName: string;
}

export function ErrorRecordsTable({ fileName }: ErrorRecordsTableProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await fetchFileErrors(fileName);
        setRecords(data);
        
        // Extract all unique column keys from the data dynamically
        if (data.length > 0) {
          const columnKeys = Array.from(
            new Set(data.flatMap(record => Object.keys(record || {})))
          ).filter(key => key.toLowerCase() !== 'id'); // Ignore 'id' column
          
          setColumns(columnKeys);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching error records:", err);
        setError("Failed to load error records. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [fileName]);

  // Function to format column name (transform from snake_case to Title Case)
  const formatColumnName = (key: string) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Function to render cell value based on its type
  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
        <span className="ml-2">Loading error records...</span>
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

  if (!records || records.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
        <p className="text-muted-foreground">No error records available for this file</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>{formatColumnName(column)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={`${index}-${column}`}>
                  {renderCellValue(record[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}