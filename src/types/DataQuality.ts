export interface DataIssue {
  id: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  category: 'missing_data' | 'duplicate' | 'format' | 'validation' | 'consistency'
  affectedRows: number
  dataset: string
  column: string
  detectedAt: Date
  status: 'pending' | 'approved' | 'rejected' | 'fixed'
  confidence: number
  aiRecommendation: {
    action: string
    explanation: string
    confidence: number
    suggestedFix: string
    impactAnalysis: string
  }
  sampleData: Array<{
    rowId: string
    originalValue: any
    suggestedValue: any
    context: Record<string, any>
  }>
}

export interface ReviewAction {
  id: string
  issueId: string
  action: 'approved' | 'rejected' | 'modified'
  timestamp: Date
  userId: string
  notes?: string
  modifiedFix?: string
}

export interface DataQualityMetrics {
  totalIssues: number
  pendingReview: number
  approved: number
  rejected: number
  fixed: number
  averageConfidence: number
}