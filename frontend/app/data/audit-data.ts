
export interface AuditData {
  audit_id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  status: 'SUCCESS' | 'ERROR' | 'IN_PROGRESS' | 'PENDING';
  processed_rows: number;
  error_rows: number;
  comments: string;
  started_at: string;
  finished_at: string | null;
}

export const auditData: AuditData[] = [
  {
    audit_id: 1001,
    file_name: "customer_data_20250920",
    file_type: "CSV",
    file_size: 2.45,
    status: "SUCCESS",
    processed_rows: 1250,
    error_rows: 0,
    comments: "Successfully processed all records",
    started_at: "2025-09-20T08:30:00",
    finished_at: "2025-09-20T08:32:15"
  },
  {
    audit_id: 1002,
    file_name: "transaction_logs_20250921",
    file_type: "JSON",
    file_size: 5.32,
    status: "SUCCESS",
    processed_rows: 3420,
    error_rows: 12,
    comments: "Minor validation errors corrected automatically",
    started_at: "2025-09-21T10:15:00",
    finished_at: "2025-09-21T10:20:45"
  },
  {
    audit_id: 1003,
    file_name: "product_inventory_20250922",
    file_type: "XML",
    file_size: 1.75,
    status: "ERROR",
    processed_rows: 450,
    error_rows: 150,
    comments: "Schema validation failed for multiple records",
    started_at: "2025-09-22T14:10:00",
    finished_at: "2025-09-22T14:12:30"
  },
  {
    audit_id: 1004,
    file_name: "user_activity_20250922",
    file_type: "CSV",
    file_size: 8.91,
    status: "SUCCESS",
    processed_rows: 7890,
    error_rows: 23,
    comments: "Large file processed successfully with minor errors",
    started_at: "2025-09-22T16:45:00",
    finished_at: "2025-09-22T17:02:10"
  },
  {
    audit_id: 1005,
    file_name: "financial_records_20250923",
    file_type: "XLSX",
    file_size: 3.21,
    status: "SUCCESS",
    processed_rows: 2100,
    error_rows: 0,
    comments: "Clean import with no errors",
    started_at: "2025-09-23T09:20:00",
    finished_at: "2025-09-23T09:25:30"
  },
  {
    audit_id: 1006,
    file_name: "customer_feedback_20250923",
    file_type: "CSV",
    file_size: 1.15,
    status: "IN_PROGRESS",
    processed_rows: 620,
    error_rows: 0,
    comments: "Processing ongoing",
    started_at: "2025-09-23T11:30:00",
    finished_at: null
  },
  {
    audit_id: 1007,
    file_name: "marketing_data_20250924",
    file_type: "JSON",
    file_size: 4.75,
    status: "ERROR",
    processed_rows: 0,
    error_rows: 0,
    comments: "File format corruption detected",
    started_at: "2025-09-24T13:15:00",
    finished_at: "2025-09-24T13:15:45"
  },
  {
    audit_id: 1008,
    file_name: "supplier_catalog_20250924",
    file_type: "XML",
    file_size: 6.32,
    status: "SUCCESS",
    processed_rows: 4250,
    error_rows: 32,
    comments: "Large file processed with minor schema issues",
    started_at: "2025-09-24T15:10:00",
    finished_at: "2025-09-24T15:25:20"
  },
  {
    audit_id: 1009,
    file_name: "employee_records_20250925",
    file_type: "XLSX",
    file_size: 2.18,
    status: "PENDING",
    processed_rows: 0,
    error_rows: 0,
    comments: "Scheduled for processing",
    started_at: "2025-09-25T08:00:00",
    finished_at: null
  },
  {
    audit_id: 1010,
    file_name: "sales_report_20250925",
    file_type: "CSV",
    file_size: 3.87,
    status: "SUCCESS",
    processed_rows: 2870,
    error_rows: 5,
    comments: "Minor formatting issues corrected",
    started_at: "2025-09-25T10:30:00",
    finished_at: "2025-09-25T10:36:15"
  },
  {
    audit_id: 1011,
    file_name: "inventory_update_20250926",
    file_type: "JSON",
    file_size: 2.95,
    status: "SUCCESS",
    processed_rows: 1780,
    error_rows: 0,
    comments: "Clean processing completed",
    started_at: "2025-09-26T09:45:00",
    finished_at: "2025-09-26T09:50:10"
  },
  {
    audit_id: 1012,
    file_name: "customer_orders_20250926",
    file_type: "CSV",
    file_size: 5.62,
    status: "IN_PROGRESS",
    processed_rows: 2100,
    error_rows: 8,
    comments: "Processing large dataset",
    started_at: "2025-09-26T14:20:00",
    finished_at: null
  },
  {
    audit_id: 1013,
    file_name: "product_pricing_20250927",
    file_type: "XLSX",
    file_size: 1.28,
    status: "SUCCESS",
    processed_rows: 950,
    error_rows: 0,
    comments: "Price updates processed successfully",
    started_at: "2025-09-27T08:10:00",
    finished_at: "2025-09-27T08:12:45"
  },
  {
    audit_id: 1014,
    file_name: "website_logs_20250927",
    file_type: "LOG",
    file_size: 7.91,
    status: "ERROR",
    processed_rows: 4500,
    error_rows: 1200,
    comments: "Log format inconsistencies detected",
    started_at: "2025-09-27T10:30:00",
    finished_at: "2025-09-27T10:45:15"
  },
  {
    audit_id: 1015,
    file_name: "customer_support_20250927",
    file_type: "CSV",
    file_size: 2.35,
    status: "PENDING",
    processed_rows: 0,
    error_rows: 0,
    comments: "Queued for processing",
    started_at: "2025-09-27T12:00:00",
    finished_at: null
  }
];

export const getStatusCounts = () => {
  const counts = {
    SUCCESS: 0,
    ERROR: 0,
    IN_PROGRESS: 0,
    PENDING: 0
  };
  
  auditData.forEach(item => {
    counts[item.status]++;
  });
  
  return counts;
};

export const getFileTypeCounts = () => {
  const counts: Record<string, number> = {};
  
  auditData.forEach(item => {
    if (!counts[item.file_type]) {
      counts[item.file_type] = 0;
    }
    counts[item.file_type]++;
  });
  
  return counts;
};

export const getProcessingTimeData = () => {
  return auditData
    .filter(item => item.finished_at !== null)
    .map(item => {
      const startTime = new Date(item.started_at).getTime();
      const endTime = new Date(item.finished_at as string).getTime();
      const processingTimeSeconds = (endTime - startTime) / 1000;
      
      return {
        audit_id: item.audit_id,
        file_name: item.file_name,
        processing_time_seconds: processingTimeSeconds,
        file_size: item.file_size
      };
    });
};

export const getErrorRateData = () => {
  return auditData
    .filter(item => item.processed_rows > 0)
    .map(item => {
      const errorRate = (item.error_rows / item.processed_rows) * 100;
      
      return {
        audit_id: item.audit_id,
        file_name: item.file_name,
        error_rate: parseFloat(errorRate.toFixed(2)),
        processed_rows: item.processed_rows,
        error_rows: item.error_rows,
        file_size: item.file_size
      };
    });
};