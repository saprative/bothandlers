export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back. Here is what is happening today.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Mock Metric Cards */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Interventions</h3>
          </div>
          <div className="text-2xl font-bold">1,245</div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">MTTR</h3>
          </div>
          <div className="text-2xl font-bold">14m 30s</div>
          <p className="text-xs text-muted-foreground">-2m from last month</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Automation Rate</h3>
          </div>
          <div className="text-2xl font-bold">88%</div>
          <p className="text-xs text-muted-foreground">Resolved by AI</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Open Assigned</h3>
          </div>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">1 Urgent SLA</p>
        </div>
      </div>
    </div>
  )
}
