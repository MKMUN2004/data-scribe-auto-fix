import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react"
import { mockMetrics, mockIssues } from "@/data/mockData"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const recentIssues = mockIssues.slice(0, 3)
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of data quality issues and AI recommendations</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.totalIssues}</div>
            <p className="text-xs text-muted-foreground">Active data quality issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.pendingReview}</div>
            <p className="text-xs text-muted-foreground">Awaiting human approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.approved}</div>
            <p className="text-xs text-muted-foreground">Ready for implementation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(mockMetrics.averageConfidence * 100)}%</div>
            <p className="text-xs text-muted-foreground">Average recommendation confidence</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Issue Resolution Progress</CardTitle>
          <CardDescription>Current status of data quality remediation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Issues Resolved</span>
              <span>{mockMetrics.fixed + mockMetrics.approved}/{mockMetrics.totalIssues}</span>
            </div>
            <Progress value={((mockMetrics.fixed + mockMetrics.approved) / mockMetrics.totalIssues) * 100} />
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span>Fixed: {mockMetrics.fixed}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-info"></div>
              <span>Approved: {mockMetrics.approved}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span>Rejected: {mockMetrics.rejected}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Issues</CardTitle>
          <CardDescription>Latest data quality issues detected by AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIssues.map((issue) => (
              <Link 
                key={issue.id} 
                to={`/issues/${issue.id}`}
                className="block p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{issue.title}</h4>
                      <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}>
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline">{issue.category.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{issue.affectedRows} rows affected</span>
                      <span>{issue.dataset}.{issue.column}</span>
                      <span>{Math.round(issue.confidence * 100)}% confidence</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {issue.status === 'pending' && <Clock className="h-4 w-4 text-warning" />}
                    {issue.status === 'approved' && <CheckCircle className="h-4 w-4 text-success" />}
                    {issue.status === 'rejected' && <XCircle className="h-4 w-4 text-destructive" />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard