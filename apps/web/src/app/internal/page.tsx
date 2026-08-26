export default function InternalDashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pending Interventions</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">0</div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h3 className="font-semibold leading-none tracking-tight">Intervention Queues (Placeholder)</h3>
          <p className="text-sm text-muted-foreground mt-2">Active interventions will appear here.</p>
        </div>
      </div>
    </div>
  )
}
