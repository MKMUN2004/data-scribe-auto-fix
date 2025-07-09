import { DataIssue, DataQualityMetrics, ReviewAction } from "@/types/DataQuality"

export const mockIssues: DataIssue[] = [
  {
    id: "issue-1",
    title: "Missing Email Addresses",
    description: "Multiple customer records are missing email addresses, preventing marketing communications",
    severity: "high",
    category: "missing_data",
    affectedRows: 127,
    dataset: "customers",
    column: "email",
    detectedAt: new Date("2024-01-15T10:30:00"),
    status: "pending",
    confidence: 0.95,
    aiRecommendation: {
      reasoning_and_remediation: "The data quality test failed because the 'email' column in the 'customers' table contains NULL values where previously there were none. Analysis shows 89% of missing emails can be recovered from order history, support tickets, and social media profiles. Remediation involves updating records using available contact data from related tables and external sources. This will enable marketing to 127 additional customers with an estimated $15,000 monthly revenue impact.",
      gcp_commands: [
        "bq query --use_legacy_sql=false 'UPDATE customers SET email = COALESCE(email, contact_history.email, external_data.email) WHERE email IS NULL'",
        "bq query --use_legacy_sql=false 'INSERT INTO data_quality_log (table_name, column_name, fix_applied, timestamp) VALUES (\"customers\", \"email\", \"filled_missing_emails\", CURRENT_TIMESTAMP())'"
      ]
    },
    sampleData: [
      {
        rowId: "cust_001",
        originalValue: null,
        suggestedValue: "john.doe@email.com",
        context: { name: "John Doe", phone: "+1234567890", lastOrder: "2024-01-10" }
      },
      {
        rowId: "cust_002", 
        originalValue: null,
        suggestedValue: "jane.smith@gmail.com",
        context: { name: "Jane Smith", phone: "+1987654321", lastOrder: "2024-01-12" }
      }
    ]
  },
  {
    id: "issue-2",
    title: "Duplicate Product Records",
    description: "Product catalog contains duplicate entries with slight variations in naming",
    severity: "medium",
    category: "duplicate",
    affectedRows: 43,
    dataset: "products",
    column: "name",
    detectedAt: new Date("2024-01-14T14:15:00"),
    status: "approved",
    confidence: 0.87,
    aiRecommendation: {
      reasoning_and_remediation: "The data quality test failed because the 'product_name' column in the 'products' table contains duplicate values. Fuzzy matching identified products with >90% similarity that should be consolidated. The root cause is inconsistent data entry creating multiple records for the same product. Remediation involves de-duplicating records and implementing preventative measures to maintain uniqueness.",
      gcp_commands: [
        "bq query --use_legacy_sql=false --destination_table products_deduplicated_temp --replace 'SELECT * FROM products QUALIFY ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_date DESC) = 1'",
        "bq rm -f products",
        "bq mv products_deduplicated_temp products"
      ]
    },
    sampleData: [
      {
        rowId: "prod_123",
        originalValue: "iPhone 15 Pro Max 256GB",
        suggestedValue: "Apple iPhone 15 Pro Max 256GB",
        context: { sku: "APL-IP15PM-256", price: 1199.99, category: "smartphones" }
      }
    ]
  },
  {
    id: "issue-3",
    title: "Invalid Date Formats",
    description: "Inconsistent date formats across order timestamps",
    severity: "low",
    category: "format",
    affectedRows: 89,
    dataset: "orders",
    column: "created_date",
    detectedAt: new Date("2024-01-13T09:45:00"),
    status: "rejected",
    confidence: 0.76,
    aiRecommendation: {
      reasoning_and_remediation: "The data quality test failed because the 'created_date' column in the 'orders' table contains inconsistent date formats (MM/DD/YYYY, DD-MM-YYYY, and ISO 8601). This inconsistency can cause parsing errors and timezone issues in downstream applications. Remediation involves standardizing all dates to ISO 8601 format (YYYY-MM-DD HH:MM:SS) for consistency.",
      gcp_commands: [
        "bq query --use_legacy_sql=false 'UPDATE orders SET created_date = PARSE_DATETIME(\"%Y-%m-%d %H:%M:%S\", FORMAT_DATETIME(\"%Y-%m-%d %H:%M:%S\", PARSE_DATETIME(\"%m/%d/%Y\", created_date))) WHERE REGEXP_CONTAINS(created_date, r\"^\\d{2}/\\d{2}/\\d{4}$\")'",
        "bq query --use_legacy_sql=false 'UPDATE orders SET created_date = PARSE_DATETIME(\"%Y-%m-%d %H:%M:%S\", FORMAT_DATETIME(\"%Y-%m-%d %H:%M:%S\", PARSE_DATETIME(\"%d-%m-%Y\", created_date))) WHERE REGEXP_CONTAINS(created_date, r\"^\\d{2}-\\d{2}-\\d{4}$\")'"
      ]
    },
    sampleData: [
      {
        rowId: "ord_456",
        originalValue: "01/15/2024",
        suggestedValue: "2024-01-15T00:00:00Z",
        context: { orderId: "ORD-2024-001", amount: 299.99, status: "completed" }
      }
    ]
  }
]

export const mockMetrics: DataQualityMetrics = {
  totalIssues: 259,
  pendingReview: 127,
  approved: 89,
  rejected: 23,
  fixed: 20,
  averageConfidence: 0.84
}

export const mockHistory: ReviewAction[] = [
  {
    id: "action-1",
    issueId: "issue-2",
    action: "approved",
    timestamp: new Date("2024-01-15T11:30:00"),
    userId: "user-1",
    notes: "Good catch on the duplicates, implementing the merge strategy"
  },
  {
    id: "action-2", 
    issueId: "issue-3",
    action: "rejected",
    timestamp: new Date("2024-01-14T16:20:00"),
    userId: "user-1",
    notes: "Date format inconsistency is acceptable for this dataset"
  }
]