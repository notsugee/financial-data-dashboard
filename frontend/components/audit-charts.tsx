"use client"

import { useState, useEffect } from "react";
import { Bar, Doughnut, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from "chart.js";
import { AuditData } from "@/app/data/audit-data";
import { 
  fetchAuditData,
  calculateStatusCounts,
  calculateFileTypeCounts,
  calculateProcessingTimeData,
  calculateErrorRateData
} from "@/app/services/api-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Common hook for fetching audit data
function useAuditData() {
  const [auditData, setAuditData] = useState<AuditData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchAuditData();
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

export function StatusChart() {
  const { auditData, loading, error } = useAuditData();
  
  const statusCounts = auditData.length > 0 
    ? calculateStatusCounts(auditData)
    : { SUCCESS: 0, ERROR: 0, IN_PROGRESS: 0, PENDING: 0 };
    
  const data = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",  
          "rgba(255, 99, 132, 0.6)",  
          "rgba(54, 162, 235, 0.6)",  
          "rgba(255, 206, 86, 0.6)"
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)"
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "File Processing Status",
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Status</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <p>Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div style={{ height: "300px" }}>
            <Doughnut data={data} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function FileTypeChart() {
  const { auditData, loading, error } = useAuditData();
  
  const fileTypeCounts = auditData.length > 0 
    ? calculateFileTypeCounts(auditData) 
    : {};
    
  const data = {
    labels: Object.keys(fileTypeCounts),
    datasets: [
      {
        label: "File Count",
        data: Object.values(fileTypeCounts),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "File Types Distribution",
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Processing Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <p>Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div style={{ height: "300px" }}>
            <Bar data={data} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProcessingTimeChart() {
  const { auditData, loading, error } = useAuditData();
  
  const processingTimeData = auditData.length > 0 
    ? calculateProcessingTimeData(auditData)
    : [];
    
  const fileNames = processingTimeData.map(item => item.file_name);
  const processingTimes = processingTimeData.map(item => item.processing_time_seconds);

  const data = {
    labels: fileNames,
    datasets: [
      {
        label: "Processing Time (seconds)",
        data: processingTimes,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "File Processing Times",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Seconds"
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Times</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <p>Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-red-500">{error}</p>
          </div>
        ) : processingTimeData.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
            <p>No processing time data available</p>
          </div>
        ) : (
          <div style={{ height: "400px" }}>
            <Bar data={data} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ErrorRateChart() {
  const { auditData, loading, error } = useAuditData();
  
  const errorRateData = auditData.length > 0 
    ? calculateErrorRateData(auditData)
    : [];
  
  const data = {
    datasets: [
      {
        label: "Error Rate vs File Size",
        data: errorRateData.map(item => ({
          x: item.processed_rows,
          y: item.error_rate,
          r: item.file_size * 3,
        })),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
      },
    ],
  };

  const options: ChartOptions<"scatter"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const item = errorRateData[context.dataIndex];
            return [
              `File: ${item.file_name}`,
              `Processed Rows: ${item.processed_rows}`,
              `Error Rate: ${item.error_rate}%`,
              `Error Rows: ${item.error_rows}`,
              `File Size: ${item.file_size} MB`
            ];
          }
        }
      },
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Error Rates by Processed Rows (bubble size = file size)",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Processed Rows"
        },
        type: "linear",
        position: "bottom"
      },
      y: {
        title: {
          display: true,
          text: "Error Rate (%)"
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[350px]">
            <p>Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-red-500">{error}</p>
          </div>
        ) : errorRateData.length === 0 ? (
          <div className="flex items-center justify-center h-[350px]">
            <p>No error rate data available</p>
          </div>
        ) : (
          <div style={{ height: "350px" }}>
            <Scatter data={data} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AuditSummaryCards() {
  const { auditData, loading, error } = useAuditData();
  
  const statusCounts = auditData.length > 0 
    ? calculateStatusCounts(auditData)
    : { SUCCESS: 0, ERROR: 0, IN_PROGRESS: 0, PENDING: 0 };
    
  const errorRateData = auditData.length > 0 
    ? calculateErrorRateData(auditData)
    : [];
  
  const totalFiles = Object.values(statusCounts).reduce((sum: number, count: number) => sum + count, 0);
  const successRate = totalFiles > 0 ? ((statusCounts.SUCCESS / totalFiles) * 100).toFixed(1) : "0.0";
  const avgErrorRate = errorRateData.length > 0 
    ? (errorRateData.reduce((sum: number, item: {error_rate: number}) => sum + item.error_rate, 0) / errorRateData.length).toFixed(2) 
    : "0.00";
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted/50 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-muted/30 rounded animate-pulse mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
        Error loading audit data. Please try again later.
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFiles}</div>
          <p className="text-xs text-muted-foreground">
            {statusCounts.SUCCESS} processed successfully
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successRate}%</div>
          <p className="text-xs text-muted-foreground">
            {statusCounts.ERROR} files with errors
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statusCounts.IN_PROGRESS + statusCounts.PENDING}</div>
          <p className="text-xs text-muted-foreground">
            {statusCounts.IN_PROGRESS} active, {statusCounts.PENDING} pending
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Avg. Error Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgErrorRate}%</div>
          <p className="text-xs text-muted-foreground">
            Across all processed files
          </p>
        </CardContent>
      </Card>
    </div>
  );
}