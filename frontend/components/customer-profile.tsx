"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerData } from "@/app/services/api-service"

interface CustomerProfileProps {
  customerData: CustomerData | null;
  isLoading: boolean;
  error: string | null;
}

export function CustomerProfile({ customerData, isLoading, error }: CustomerProfileProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Profile</CardTitle>
          <CardDescription>Loading customer information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-muted animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Profile</CardTitle>
          <CardDescription>Error loading customer information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-lg">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!customerData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Profile</CardTitle>
          <CardDescription>Customer information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No customer information available.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Extract customer information from the data
  const customerId = customerData.customer_id;
  const firstName = customerData.first_name || customerData.name?.split(' ')[0] || '';
  const lastName = customerData.last_name || (customerData.name ? customerData.name.split(' ').slice(1).join(' ') : '');
  const email = customerData.email || '';
  const phone = customerData.phone || customerData.phone_number || '';
  const address = customerData.address || '';
  
  // Get initials for the avatar fallback
  const initials = firstName.charAt(0) + (lastName ? lastName.charAt(0) : '');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Profile</CardTitle>
        <CardDescription>Customer information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex justify-center">
            <Avatar className="w-24 h-24 text-2xl">
              <AvatarImage src={customerData.avatar_url || ""} alt={firstName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Customer ID</p>
              <p className="font-medium">{customerId}</p>
            </div>
            
            {email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{email}</p>
              </div>
            )}
            
            {phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{phone}</p>
              </div>
            )}
            
            {address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{address}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}