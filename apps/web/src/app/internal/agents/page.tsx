export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agents & Integrations</h2>
          <p className="text-muted-foreground">
            Register AI agents and monitor callback webhook health.
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
          + Register Agent
        </button>
      </div>

      <div className="grid gap-4">
        {/* Mock Agent Row */}
        <div className="flex items-center justify-between rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <h3 className="font-semibold text-lg">ProcurementBot v2.1</h3>
            </div>
            <div className="text-sm text-muted-foreground">Framework: LangGraph | Interventions (30d): 452</div>
            <div className="text-sm font-medium text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-md">
              Last Delivery: 200 OK (2 mins ago)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-muted">Keys</button>
            <button className="px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-muted">Edit</button>
            <button className="px-3 py-1.5 border border-destructive text-destructive rounded-md text-sm font-medium hover:bg-destructive/10">Stop</button>
          </div>
        </div>

        {/* Mock Agent Row */}
        <div className="flex items-center justify-between rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <h3 className="font-semibold text-lg">RefundAgent</h3>
            </div>
            <div className="text-sm text-muted-foreground">Framework: OpenAI Swarm | Interventions (30d): 1,024</div>
            <div className="text-sm font-medium text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-md">
              Last Delivery: 503 Retrying (14 mins ago)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-muted">Keys</button>
            <button className="px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-muted">Edit</button>
            <button className="px-3 py-1.5 border border-destructive text-destructive rounded-md text-sm font-medium hover:bg-destructive/10">Stop</button>
          </div>
        </div>
      </div>
    </div>
  )
}
