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
      action: "Fill missing emails using contact history and external data sources",
      explanation: "Analysis shows 89% of missing emails can be recovered from order history, support tickets, and social media profiles",
      confidence: 0.89,
      suggestedFix: "UPDATE customers SET email = COALESCE(email, contact_history.email, external_data.email) WHERE email IS NULL",
      impactAnalysis: "Will enable marketing to 127 additional customers, estimated $15,000 monthly revenue impact"
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
      action: "Merge duplicate products and standardize naming convention",
      explanation: "Fuzzy matching identified products with >90% similarity that should be consolidated",
      confidence: 0.87,
      suggestedFix: "Merge duplicates and update all references to use canonical product IDs",
      impactAnalysis: "Will improve search accuracy and reduce inventory confusion"
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
      action: "Standardize all dates to ISO 8601 format",
      explanation: "Multiple date formats detected: MM/DD/YYYY, DD-MM-YYYY, and ISO 8601",
      confidence: 0.76,
      suggestedFix: "Convert all dates to YYYY-MM-DD HH:MM:SS format",
      impactAnalysis: "Will improve data consistency and prevent timezone issues"
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