"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { CustomerProfile } from "@/components/customer-profile";
import { CustomerTransactions } from "@/components/customer-transactions";
import { CustomerData, fetchCustomerData } from "@/app/services/api-service";
import { AlertCircle } from "lucide-react";
import { PDFExportButton } from "@/components/ui/pdf-export-button"


export default function CustomerPage() {
    const [customerId, setCustomerId] = useState<string>("");
    const [transactionType, setTransactionType] = useState<string>("all");
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState<boolean>(false);

    const handleCustomerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomerId(e.target.value);
    };

    const handleTransactionTypeChange = (value: string) => {
        setTransactionType(value);
        
        // If we already have customer data and the transaction type changes, 
        // fetch again with the new filter
        if (customerData && hasSearched) {
            handleFetchCustomer();
        }
    };

    const handleFetchCustomer = async () => {
        // Validate customer ID
        if (!customerId.trim()) {
            setError("Please enter a customer ID");
            toast.error("Please enter a valid Customer ID");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        
        try {
            const data = await fetchCustomerData(
                customerId, 
                transactionType === "all" ? undefined : transactionType
            );
            
            setCustomerData(data);
            toast.success("Customer data loaded successfully");
        } catch (err) {
            console.error("Error fetching customer data:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch customer data";
            setError(errorMessage);
            toast.error(errorMessage);
            setCustomerData(null);
        } finally {
            setIsLoading(false);
        }
    };

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
                        <div className="flex flex-col gap-6 p-4 md:p-6">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-2xl font-bold">Customer Dashboard</h1>
                                <p className="text-muted-foreground">
                                    Search for customers and view their transactions
                                </p>
                            </div>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Search</CardTitle>
                                    <CardDescription>Search for customers and filter transactions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="customerId">Customer ID</Label>
                                            <Input 
                                                id="customerId"
                                                placeholder="Enter customer ID" 
                                                value={customerId}
                                                onChange={handleCustomerIdChange}
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="transactionType">Transaction Type</Label>
                                            <Select 
                                                value={transactionType} 
                                                onValueChange={handleTransactionTypeChange}
                                            >
                                                <SelectTrigger id="transactionType" className="w-full">
                                                    <SelectValue placeholder="Select transaction type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Types</SelectItem>
                                                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                                                    <SelectItem value="UPI">UPI</SelectItem>
                                                    <SelectItem value="Retail">Retail</SelectItem>
                                                    <SelectItem value="Trade">Trade</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        {/* Fetch Button */}
                                        <div className="flex items-end">
                                            <Button 
                                                onClick={handleFetchCustomer} 
                                                className="w-full"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Spinner size="sm" className="mr-2" />
                                                        Fetching...
                                                    </>
                                                ) : (
                                                    "Fetch Customer Data"
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {error && (
                                        <Alert variant="destructive" className="mt-4">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Error</AlertTitle>
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                            
                            {/* Display area - show placeholder if no search has been done yet */}
                            {!hasSearched ? (
                                <div className="text-center p-8 bg-muted/20 rounded-lg border border-dashed">
                                    Enter a customer ID and click "Fetch Customer Data" to view details.
                                </div>
                            ) : isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Spinner size="md" variant="primary" className="mb-4" />
                                    <p className="text-muted-foreground">Loading customer data...</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    <div>
                                        <CustomerProfile 
                                            customerData={customerData}
                                            isLoading={isLoading}
                                            error={error}
                                        />
                                    </div>
                                    <div>
                                        <CustomerTransactions 
                                            customerData={customerData}
                                            isLoading={isLoading}
                                            error={error}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}