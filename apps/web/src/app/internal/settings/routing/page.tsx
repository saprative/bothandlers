export default function RoutingRulesPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Routing Rules</h2>
        <p className="text-muted-foreground">
          Configure how interventions are routed to human operators.
        </p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="border-b px-6 py-4 flex gap-6">
          <button className="font-semibold text-sm border-b-2 border-primary pb-4 -mb-4">Manual Rules</button>
          <button className="font-medium text-sm text-muted-foreground pb-4 -mb-4">Agentic Engine (Pro)</button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-semibold">High Value Refunds</h3>
              <p className="text-sm text-muted-foreground">Routes refunds &gt; $500 to Finance Tier 2</p>
            </div>
            <button className="px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-muted">Edit</button>
          </div>
          
          <div className="pt-4">
            <h4 className="font-semibold text-sm mb-4">✨ AI-Assisted Rule Builder</h4>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Describe your routing policy... (e.g. 'Route AWS invoices to IT')" 
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              />
              <button className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium">
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
