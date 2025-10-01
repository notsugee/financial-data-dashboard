"use client"

import React, { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Generic type for API data
interface ApiData {
  [key: string]: any
}

export function AuditErrorsTable() {
  const [data, setData] = useState<ApiData[]>([])
  const [rawData, setRawData] = useState<ApiData[]>([]) // keep original for dialog
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ApiData | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false)
  const [headers, setHeaders] = useState<string[]>([])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://127.0.0.1:5000/audits/errors")

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`)
      }

      const responseData = await response.json()
      const records = responseData.error_records || []

      // extract record objects for table
      const tableData = records.map((item: any) => item.record || {})

      setRawData(records)
      setData(tableData)
      setHeaders(Object.keys(tableData[0] || {}))
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load data. Please try again.")
      setData([])
      setRawData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return "-"
    if (typeof value === "boolean") return value ? "Yes" : "No"
    return String(value)
  }

  const handleRowClick = (rowIndex: number) => {
    setSelectedItem(rawData[rowIndex]) // show full record + errors in dialog
    setDetailsDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Audit Errors</CardTitle>
              <CardDescription>
                Records with validation issues from the audit
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
              className="flex gap-2 items-center"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500 py-4 text-center">{error}</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableCaption>
                  {isLoading
                    ? "Loading data..."
                    : data.length === 0
                    ? "No records with errors"
                    : `Showing ${data.length} records. Click a row for details.`}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHead
                        key={header}
                        className="whitespace-nowrap"
                      >
                        {header
                          .charAt(0)
                          .toUpperCase() +
                          header
                            .slice(1)
                            .replace(/([A-Z])/g, " $1")
                            .replace(/_/g, " ")}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={headers.length || 1}
                        className="h-24 text-center"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={headers.length || 1}
                        className="h-24 text-center"
                      >
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(rowIndex)}
                      >
                        {headers.map((header) => (
                          <TableCell
                            key={`${rowIndex}-${header}`}
                            className="max-w-[300px] truncate"
                          >
                            {formatValue(row[header])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Record Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this record
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold">Invalid Fields</h4>
                {selectedItem.invalid_fields?.length > 0 ? (
                  <ul className="list-disc pl-4 text-sm">
                    {selectedItem.invalid_fields.map((field: string) => (
                      <li key={field}>
                        <Badge variant="destructive">{field}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">None</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold">Errors</h4>
                {selectedItem.errors?.length > 0 ? (
                  <ul className="list-disc pl-4 text-sm space-y-1">
                    {selectedItem.errors.map((err: any, i: number) => (
                      <li key={i}>
                        <strong>{err.loc?.join(".")}</strong>: {err.msg}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No errors</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold">Record Data</h4>
                <div className="bg-muted p-3 rounded-md mt-1 overflow-auto max-h-96">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(selectedItem.record, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDetailsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
