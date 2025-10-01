"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ErrorRecordsTable } from "@/components/error-records-table"

export default function ErrorDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const fileName = Array.isArray(params.fileName) 
    ? params.fileName[0] 
    : params.fileName as string
  
  const decodedFileName = decodeURIComponent(fileName)
  
  const handleBack = () => {
    router.back()
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Error Details</h1>
          <p className="text-muted-foreground">
            File: {decodedFileName}
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Error Records</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorRecordsTable fileName={decodedFileName} />
        </CardContent>
      </Card>
    </>
  )
}