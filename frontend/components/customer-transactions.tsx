"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomerData, CustomerTransaction } from "@/app/services/api-service"

interface CustomerTransactionsProps {
  customerData: CustomerData | null;
  isLoading: boolean;
  error: string | null;
}

export function CustomerTransactions({ customerData, isLoading, error }: CustomerTransactionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading customer transactions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-lg">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!customerData || !customerData.records || customerData.records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No transactions found for this customer.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  console.log("CustomerData received:", customerData);
  
  let transactions: any[] = [];
  for (const key in customerData) {
    if (Array.isArray(customerData[key]) && customerData[key].length > 0) {
      transactions = customerData[key];
      console.log(`Found transactions array in property "${key}" with ${transactions.length} items`);
      break;
    }
  }
  
  // Extract all unique column keys from the data dynamically, ignoring the 'id' column
  const columnKeys = transactions.length > 0 
    ? Array.from(new Set(transactions.flatMap(transaction => Object.keys(transaction || {}))))
      .filter(key => key.toLowerCase() !== '_id')
    : [];
    
  console.log("Detected columns:", columnKeys);
  
  // Format keys for display (transform from snake_case to Title Case)
  const formatColumnName = (key: string) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Function to format transaction date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  }

  // Function to render status badge with appropriate color
  const renderStatus = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes("success") || statusLower.includes("completed")) {
      return <Badge variant="success">{status}</Badge>;
    } else if (statusLower.includes("fail") || statusLower.includes("error")) {
      return <Badge variant="destructive">{status}</Badge>;
    } else if (statusLower.includes("pending") || statusLower.includes("progress")) {
      return <Badge variant="warning">{status}</Badge>;
    } else {
      return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Customer Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              Showing {transactions.length} records
            </TableCaption>
          <TableHeader>
            <TableRow>
              {columnKeys.map((key) => (
                <TableHead key={key}>{formatColumnName(key)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={transaction.transaction_id || index}>
                {columnKeys.map((key) => (
                  <TableCell key={`${index}-${key}`}>
                    {(() => {
                      const value = transaction[key];
                      
                      // Handle null and undefined
                      if (value === null || value === undefined) {
                        return 'N/A';
                      }
                      
                      // Handle status-like fields with badges
                      if ((typeof value === 'string') && 
                          (key.toLowerCase().includes('status') || 
                           key.toLowerCase().includes('state'))) {
                        return renderStatus(value);
                      }
                      
                      // Handle date-like fields
                      if ((typeof value === 'string') && 
                          (key.toLowerCase().includes('date') || 
                           key.toLowerCase().includes('time') ||
                           /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value))) {
                        return formatDate(value);
                      }
                      
                      // Handle monetary fields
                      if (typeof value === 'number' && 
                          (key.toLowerCase().includes('amount') || 
                           key.toLowerCase().includes('price') ||
                           key.toLowerCase().includes('balance') ||
                           key.toLowerCase().includes('cost'))) {
                        return new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 2
                        }).format(value);
                      }
                      
                      // Handle boolean values
                      if (typeof value === 'boolean') {
                        return value ? 'Yes' : 'No';
                      }
                      
                      // Handle objects
                      if (typeof value === 'object') {
                        return JSON.stringify(value);
                      }
                      
                      // Default case
                      return String(value);
                    })()}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  )
}