import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Clock, XCircle, Search, Filter } from "lucide-react"
import { mockIssues } from "@/data/mockData"
import { Link } from "react-router-dom"
import { DataIssue } from "@/types/DataQuality"
import { FileUpload } from "@/components/FileUpload"

const Issues = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [apiResults, setApiResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [useApiData, setUseApiData] = useState(false)

  // Convert API results to DataIssue format
  const convertApiResults = (results: any[]): DataIssue[] => {
    return results.map((result, index) => ({
      id: `api-${index}`,
      title: result.issue || "Data Quality Issue",
      description: result.issue || "No description available",
      severity: result.remediation?.gcp_commands?.length > 2 ? 'high' : 'medium',
      status: 'pending' as const,
      category: 'validation' as const,
      dataset: result.context?.table_name || "unknown",
      column: result.context?.column_name || "unknown",
      affectedRows: parseInt(result.context?.affected_rows) || 0,
      confidence: 0.85,
      detectedAt: new Date(),
      sampleData: [{
        rowId: "1",
        originalValue: "N/A",
        suggestedValue: "N/A",
        context: {}
      }],
      aiRecommendation: result.remediation || {
        reasoning_and_remediation: "No remediation available",
        gcp_commands: []
      }
    }))
  }

  const handleAnalysisComplete = (results: any[]) => {
    setApiResults(results)
    setUseApiData(true)
  }

  const allIssues = useApiData ? convertApiResults(apiResults) : mockIssues
  const filteredIssues = allIssues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.dataset.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter
    const matchesSeverity = severityFilter === "all" || issue.severity === severityFilter
    const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter

    return matchesSearch && matchesStatus && matchesSeverity && matchesCategory
  })

  const getStatusIcon = (status: DataIssue['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'fixed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Quality Issues</h2>
        <p className="text-muted-foreground">Upload Excel files to analyze data quality issues or view existing issues</p>
      </div>

      {/* File Upload */}
      <FileUpload 
        onAnalysisComplete={handleAnalysisComplete}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      {/* Reset to Mock Data */}
      {useApiData && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Showing API Results</div>
                <div className="text-sm text-muted-foreground">
                  Currently displaying {apiResults.length} issues from uploaded file
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setUseApiData(false)}
              >
                View Mock Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="missing_data">Missing Data</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
                <SelectItem value="format">Format</SelectItem>
                <SelectItem value="validation">Validation</SelectItem>
                <SelectItem value="consistency">Consistency</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setSeverityFilter("all")
                setCategoryFilter("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Issues ({filteredIssues.length})</h3>
        </div>

        {filteredIssues.map((issue) => (
          <Card key={issue.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(issue.status)}
                    <h4 className="font-semibold text-lg">{issue.title}</h4>
                    <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}>
                      {issue.severity}
                    </Badge>
                    <Badge variant="outline">{issue.category.replace('_', ' ')}</Badge>
                  </div>
                  
                  <p className="text-muted-foreground">{issue.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {issue.affectedRows} rows affected
                    </span>
                    <span>Dataset: {issue.dataset}.{issue.column}</span>
                    <span>Confidence: {Math.round(issue.confidence * 100)}%</span>
                    <span>Detected: {issue.detectedAt.toLocaleDateString()}</span>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm font-medium mb-1">AI Recommendation:</div>
                    <div className="text-sm text-muted-foreground">{issue.aiRecommendation.reasoning_and_remediation.split('.')[0]}.</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link to={`/review/${issue.id}`}>
                    <Button size="sm">Review</Button>
                  </Link>
                  <Link to={`/issues/${issue.id}`}>
                    <Button variant="outline" size="sm">Details</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredIssues.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No issues found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Issues