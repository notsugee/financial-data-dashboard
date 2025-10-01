import { AuditData } from "../data/audit-data";

// Interface for customer transaction data
export interface CustomerTransaction {
  transaction_id?: string;
  amount: number;
  date: string;
  transaction_type: string;
  description?: string;
  status: string;
  merchant?: string;
  account_number?: string;
  [key: string]: any; // For any other properties in the transaction data
}

// Interface for customer data
export interface CustomerData {
  customer_id: string;
  records?: CustomerTransaction[];
  collection?: string;
  [key: string]: any; // For any other properties in the response
}

const API_BASE_URL = "http://127.0.0.1:5000";

/**
 * Fetches customer data from the API endpoint
 * @param customerId The ID of the customer to fetch data for
 * @param transactionType Optional transaction type to filter by (upi, credit, trade, retail)
 * @returns Promise containing the customer data
 */
export async function fetchCustomerData(
  customerId: string, 
  transactionType?: string
): Promise<CustomerData> {
  try {
    // Construct URL with optional transaction type filter
    let url = `${API_BASE_URL}/fetch/${customerId}`;
    
    if (transactionType && transactionType !== 'all') {
      // Map UI-friendly names to API collection keys
      const collectionMap: Record<string, string> = {
        'Credit Card': 'credit',
        'UPI': 'upi',
        'Retail': 'retail',
        'Trade': 'trade'
      };
      
      const collectionKey = collectionMap[transactionType];
      if (collectionKey) {
        url += `?collection=${collectionKey}`;
      }
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching customer data for ID ${customerId}:`, error);
    throw error;
  }
}

/**
 * Fetches audit data from the API endpoint
 * @returns Promise containing the audit data
 */
export async function fetchAuditData(type: "audit" | "error", fileName: string): Promise<AuditData[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/audits`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)
    return data || []; 
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}


/**
 * Calculates status counts from audit data
 */
export function calculateStatusCounts(data: AuditData[]) {
  const counts = {
    SUCCESS: 0,
    ERROR: 0,
    IN_PROGRESS: 0,
    PENDING: 0
  };
  
  data.forEach(item => {
    counts[item.status]++;
  });
  
  return counts;
}

/**
 * Calculates file type counts from audit data
 */
export function calculateFileTypeCounts(data: AuditData[]) {
  const counts: Record<string, number> = {};
  
  data.forEach(item => {
    if (!counts[item.file_type]) {
      counts[item.file_type] = 0;
    }
    counts[item.file_type]++;
  });
  
  return counts;
}

/**
 * Calculates processing time data from audit data
 */
export function calculateProcessingTimeData(data: AuditData[]) {
  return data
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
}

/**
 * Calculates error rate data from audit data
 */
export function calculateErrorRateData(data: AuditData[]) {
  return data
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
}