import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define error types with their possible messages and details
const errorTypes = [
  {
    type: 'ValidationError',
    messages: [
      'Invalid file format',
      'Missing required fields',
      'Data validation failed',
      'Schema validation failed',
      'Invalid input data'
    ],
    details: [
      'Expected PDF, received DOCX',
      'Required field "account_id" is missing',
      'Value out of accepted range',
      'Data does not match required schema',
      'Input contains invalid characters'
    ]
  },
  {
    type: 'ProcessingError',
    messages: [
      'Failed to extract data from file',
      'Processing timeout',
      'Memory allocation error',
      'Process terminated unexpectedly',
      'Computation error'
    ],
    details: [
      'Excel formula error in cell B24',
      'Process exceeded time limit of 30s',
      'Out of memory during data processing',
      'Process crashed with exit code 1',
      'Division by zero error in calculation'
    ]
  },
  {
    type: 'AccessDenied',
    messages: [
      'Insufficient permissions to process file',
      'Authentication failed',
      'API rate limit exceeded',
      'Resource temporarily unavailable',
      'Access token expired'
    ],
    details: [
      'User lacks read permissions for the source',
      'Invalid credentials provided',
      'Too many requests in 5-minute window',
      'Resource is locked by another process',
      'Token expired at 2023-09-28T15:30:00Z'
    ]
  },
  {
    type: 'DataIntegrityError',
    messages: [
      'Missing required fields',
      'Corrupted data detected',
      'Checksum verification failed',
      'Data consistency error',
      'Foreign key violation'
    ],
    details: [
      'Column "account_number" is empty for 15 rows',
      'File appears to be corrupted or truncated',
      'Expected MD5: a1b2c3, Actual: d4e5f6',
      'Records do not balance properly',
      'Referenced entity does not exist'
    ]
  },
  {
    type: 'SystemError',
    messages: [
      'System resource unavailable',
      'Network connection failed',
      'Database timeout',
      'File system error',
      'External service unavailable'
    ],
    details: [
      'Insufficient disk space',
      'Connection refused to host 10.0.0.5',
      'Database query timed out after 30s',
      'Too many open files',
      'External API returned 503 Service Unavailable'
    ]
  }
];

// Status options
const statuses = ['New', 'In Progress', 'Resolved'];

// Random helper function
const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export async function GET() {
  try {
    // Dynamically read the main data.json to generate related errors
    const dataFilePath = path.join(process.cwd(), 'app', 'data.json');
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const auditData = JSON.parse(fileData);
    
    // Generate dynamic error data based on the audit items
    const errorData = auditData.slice(0, 12).map((item: any, index: number) => {
      // Select a random error type
      const errorTypeObj = random(errorTypes);
      
      // Random status with higher probability for 'New' and 'In Progress'
      const statusRandom = Math.random();
      const status = statusRandom < 0.5 ? 'New' : statusRandom < 0.8 ? 'In Progress' : 'Resolved';
      
      // Generate timestamp within last 3 days (newer for 'New' status)
      const timeOffset = status === 'New' 
        ? randomInt(1, 12) * 3600000  // 1-12 hours ago for new errors
        : status === 'In Progress'
          ? randomInt(12, 48) * 3600000  // 12-48 hours ago for in-progress
          : randomInt(48, 72) * 3600000;  // 48-72 hours ago for resolved
      
      // Create file name based on document header
      const fileExtensions = ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'csv', 'json', 'xml'];
      const fileExtension = random(fileExtensions);
      const fileName = item.header.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.' + fileExtension;
      
      return {
        id: `err-${(index + 1).toString().padStart(3, '0')}`,
        fileId: `file-${item.id.toString().padStart(6, '0')}`,
        fileName: fileName,
        timestamp: new Date(Date.now() - timeOffset).toISOString(),
        errorType: errorTypeObj.type,
        errorMessage: random(errorTypeObj.messages),
        errorDetails: random(errorTypeObj.details) + (Math.random() > 0.5 ? ` (Document: ${item.header})` : ''),
        status: status
      };
    });

    // Return the dynamically generated error data
    return NextResponse.json(errorData);
  } catch (error) {
    console.error('Error generating audit error data:', error);
    return NextResponse.json({ error: 'Failed to generate error data' }, { status: 500 });
  }
}