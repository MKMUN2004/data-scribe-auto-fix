import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Clock, Search, Filter, History as HistoryIcon, User } from "lucide-react"
import { mockHistory, mockIssues } from "@/data/mockData"
import { ReviewAction } from "@/types/DataQuality"

const History = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  // Combine history with issue data for richer display
  const enrichedHistory = mockHistory.map(action => ({
    ...action,
    issue: mockIssues.find(issue => issue.id === action.issueId)
  }))

  const filteredHistory = enrichedHistory.filter((item) => {
    const matchesSearch = item.issue?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.issue?.dataset.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === "all" || item.action === actionFilter
    
    // Simple date filtering - could be enhanced with date picker
    const matchesDate = dateFilter === "all" || (() => {
      const actionDate = item.timestamp
      const now = new Date()
      switch (dateFilter) {
        case "today":
          return actionDate.toDateString() === now.toDateString()
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return actionDate >= weekAgo
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return actionDate >= monthAgo
        default:
          return true
      }
    })()

    return matchesSearch && matchesAction && matchesDate
  })

  const getActionIcon = (action: ReviewAction['action']) => {
    switch (action) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'modified':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <HistoryIcon className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActionBadge = (action: ReviewAction['action']) => {
    switch (action) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'modified':
        return <Badge className="bg-blue-100 text-blue-800">Modified</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  // Calculate summary statistics
  const stats = {
    total: mockHistory.length,
    approved: mockHistory.filter(h => h.action === 'approved').length,
    rejected: mockHistory.filter(h => h.action === 'rejected').length,
    modified: mockHistory.filter(h => h.action === 'modified').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Review History</h2>
        <p className="text-muted-foreground">Track all human decisions on AI recommendations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <HistoryIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time decisions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modified</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.modified}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.modified / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="modified">Modified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("")
                setActionFilter("all")
                setDateFilter("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Timeline */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Review Timeline ({filteredHistory.length})</h3>
        </div>

        {filteredHistory.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(item.action)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg mb-1">
                        {item.issue?.title || "Unknown Issue"}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        {getActionBadge(item.action)}
                        {item.issue && (
                          <Badge variant="outline">
                            {item.issue.category.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <User className="h-3 w-3" />
                        {item.userId}
                      </div>
                      <div>{item.timestamp.toLocaleString()}</div>
                    </div>
                  </div>

                  {item.issue && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.issue.description}
                    </p>
                  )}

                  {item.notes && (
                    <div className="bg-muted/50 p-3 rounded-lg mb-3">
                      <div className="font-medium text-sm mb-1">Review Notes:</div>
                      <p className="text-sm text-muted-foreground">{item.notes}</p>
                    </div>
                  )}

                  {item.modifiedFix && (
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                      <div className="font-medium text-sm mb-1">Modified Fix:</div>
                      <code className="text-xs font-mono">{item.modifiedFix}</code>
                    </div>
                  )}

                  {item.issue && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                      <span>{item.issue.affectedRows} rows affected</span>
                      <span>Dataset: {item.issue.dataset}.{item.issue.column}</span>
                      <span>Original confidence: {Math.round(item.issue.confidence * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredHistory.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No history found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default History