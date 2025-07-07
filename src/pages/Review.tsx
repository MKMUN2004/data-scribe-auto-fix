import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Database, Lightbulb } from "lucide-react"
import { mockIssues } from "@/data/mockData"
import { toast } from "@/hooks/use-toast"

const Review = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [notes, setNotes] = useState("")
  const [modifiedFix, setModifiedFix] = useState("")
  
  const issue = mockIssues.find(i => i.id === id)
  
  if (!issue) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Issue not found</h2>
        <Button onClick={() => navigate('/issues')}>Back to Issues</Button>
      </div>
    )
  }

  const handleApprove = () => {
    toast({
      title: "Issue Approved",
      description: "The AI recommendation has been approved for implementation.",
    })
    navigate('/issues')
  }

  const handleReject = () => {
    toast({
      title: "Issue Rejected",
      description: "The AI recommendation has been rejected.",
    })
    navigate('/issues')
  }

  const handleModify = () => {
    if (!modifiedFix.trim()) {
      toast({
        title: "Error",
        description: "Please provide a modified fix before submitting.",
        variant: "destructive"
      })
      return
    }
    
    toast({
      title: "Issue Modified",
      description: "Your modified fix has been submitted for implementation.",
    })
    navigate('/issues')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/issues')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Issues
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review Issue</h2>
          <p className="text-muted-foreground">Evaluate AI recommendation and take action</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {issue.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}>
                    {issue.severity}
                  </Badge>
                  <Badge variant="outline">{issue.category.replace('_', ' ')}</Badge>
                </div>
              </div>
              <CardDescription>{issue.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Affected Rows</div>
                  <div className="text-muted-foreground">{issue.affectedRows}</div>
                </div>
                <div>
                  <div className="font-medium">Dataset</div>
                  <div className="text-muted-foreground">{issue.dataset}.{issue.column}</div>
                </div>
                <div>
                  <div className="font-medium">Detected</div>
                  <div className="text-muted-foreground">{issue.detectedAt.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="font-medium">Confidence</div>
                  <div className="text-muted-foreground">{Math.round(issue.confidence * 100)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Recommendation
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Confidence:</span>
                <Progress value={issue.aiRecommendation.confidence * 100} className="w-24" />
                <span className="text-sm font-medium">{Math.round(issue.aiRecommendation.confidence * 100)}%</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Recommended Action</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {issue.aiRecommendation.action}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Explanation</h4>
                <p className="text-sm text-muted-foreground">
                  {issue.aiRecommendation.explanation}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Suggested Fix</h4>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <code className="text-sm font-mono">{issue.aiRecommendation.suggestedFix}</code>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Impact Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  {issue.aiRecommendation.impactAnalysis}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sample Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sample Data
              </CardTitle>
              <CardDescription>
                Examples of affected data rows and suggested transformations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issue.sampleData.map((sample, index) => (
                  <div key={sample.rowId} className="border rounded-lg p-4">
                    <div className="font-medium text-sm mb-2">Row ID: {sample.rowId}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-red-600 mb-1">Original Value</div>
                        <div className="bg-red-50 p-2 rounded border">
                          {sample.originalValue === null ? "NULL" : String(sample.originalValue)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-green-600 mb-1">Suggested Value</div>
                        <div className="bg-green-50 p-2 rounded border">
                          {String(sample.suggestedValue)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="font-medium mb-1">Context</div>
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        {Object.entries(sample.context).map(([key, value]) => (
                          <span key={key} className="mr-4">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Take Action</CardTitle>
              <CardDescription>
                Review the AI recommendation and choose your response
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleApprove} className="w-full" size="lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Recommendation
              </Button>
              
              <Button onClick={handleReject} variant="destructive" className="w-full" size="lg">
                <XCircle className="h-4 w-4 mr-2" />
                Reject Recommendation
              </Button>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Modify & Approve</h4>
                <Textarea
                  placeholder="Enter your modified fix..."
                  value={modifiedFix}
                  onChange={(e) => setModifiedFix(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={handleModify} 
                  variant="outline" 
                  className="w-full"
                  disabled={!modifiedFix.trim()}
                >
                  Submit Modified Fix
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Notes</h4>
                <Textarea
                  placeholder="Add notes about your decision..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issue Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>AI Confidence</span>
                <span className="font-medium">{Math.round(issue.aiRecommendation.confidence * 100)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Data Quality Impact</span>
                <span className="font-medium">{issue.severity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Affected Records</span>
                <span className="font-medium">{issue.affectedRows}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Detection Method</span>
                <span className="font-medium">AI Analysis</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Review