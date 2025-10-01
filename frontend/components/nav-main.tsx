"use client"

import { IconCirclePlusFilled, IconUpload, IconFile, IconX, IconCheck, type Icon } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef } from "react"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "./ui/dialog"
import { DialogTitle, DialogTrigger } from "@radix-ui/react-dialog"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"

function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const supportedTypes = ['csv', 'xls', 'xlsx', 'json', 'xml', 'pdf'];
    
    if (!extension || !supportedTypes.includes(extension)) {
      toast.error(`Unsupported file type: ${extension}. Please upload CSV, XLS, XLSX, JSON, XML, or PDF files.`);
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.error);
        throw new Error(errorData.error || "Failed to upload file");
      }

      // Show success toast with file details
      toast.success(
        <div className="flex items-start">
          <IconCheck className="mr-2 h-5 w-5 text-green-500 shrink-0" />
          <div>
            <p className="font-semibold">File uploaded successfully</p>
            <p className="text-sm text-muted-foreground">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
          </div>
        </div>
      );
      
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Input 
          ref={fileInputRef}
          type="file" 
          onChange={handleFileChange} 
          disabled={uploading}
        />
        
        {file && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <IconFile className="h-4 w-4" />
            <span className="text-sm flex-1 truncate" title={file.name}>{file.name}</span>
            <span className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={removeFile}
              disabled={uploading}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {uploadProgress > 0 && (
          <div className="space-y-1">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full bg-primary transition-all" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-right text-muted-foreground">{uploadProgress}%</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Uploading...
            </>
          ) : (
            <>
              <IconUpload className="mr-2 h-4 w-4" />
              Upload
            </>
          )}
        </Button>
        
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">CSV</Badge>
          <Badge variant="outline">XLS/XLSX</Badge>
          <Badge variant="outline">JSON</Badge>
          <Badge variant="outline">XML</Badge>
          <Badge variant="outline">PDF</Badge>
        </div>
      </div>
    </div>
  );
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname();

  // Function to check if a nav item is active
  const isActive = (url: string): boolean => {
    if (url === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(url);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
            <SidebarMenuButton
              tooltip="Upload Files"
              className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <div>
                <span>Upload</span>
              </div>
            </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Files</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload data files for processing (CSV, XLS, XLSX, JSON, XML, PDF)
                  </p>
                </DialogHeader>
                <UploadForm />
              </DialogContent>
            </Dialog>
            
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url} style={{ width: '100%', display: 'block' }}>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    className={active ? "bg-accent text-accent-foreground" : ""}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
