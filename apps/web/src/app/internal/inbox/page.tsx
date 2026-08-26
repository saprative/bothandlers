export default function InboxPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inbox</h2>
          <p className="text-muted-foreground">
            Manage your assigned interventions and team queues.
          </p>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Intervention List Sidebar */}
        <div className="w-80 flex flex-col gap-2 overflow-y-auto border-r pr-4">
          <div className="rounded-lg border bg-muted/50 p-4 shadow-sm border-l-4 border-l-red-500">
            <h4 className="font-semibold text-sm">Expense Approval: $12,500</h4>
            <p className="text-xs text-muted-foreground mt-1">SLA: 45 mins remaining</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h4 className="font-semibold text-sm">Contract Review</h4>
            <p className="text-xs text-muted-foreground mt-1">SLA: 2 hours remaining</p>
          </div>
        </div>

        {/* Intervention Detail View */}
        <div className="flex-1 flex flex-col rounded-lg border bg-card shadow-sm">
          <div className="border-b p-6">
            <h3 className="text-xl font-semibold">Expense Approval: $12,500 for AWS Invoice</h3>
            <p className="text-sm text-muted-foreground mt-1">Raised by: ProcurementBot v2.1</p>
          </div>
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Why it needs you (Policy Boundary)</h4>
              <p className="text-sm text-muted-foreground">Amount ($12,500) exceeds autonomous limit ($5,000).</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Agent Recommendation</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border">Approve. Matches historical AWS spend trajectory. (Confidence: 98%)</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Decision Required</h4>
              <div className="flex gap-2 mt-4">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">Approve</button>
                <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium">Reject</button>
                <button className="px-4 py-2 border rounded-md text-sm font-medium">Request Info</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
