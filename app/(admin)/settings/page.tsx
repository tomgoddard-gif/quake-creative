import { SettingsForm } from '@/components/admin/SettingsForm'
import { getAppSettings } from '@/lib/data/settings'
import { quakeConfig } from '@/lib/client-config/quake'

export default async function SettingsPage() {
  let settings = { product_knowledge: '', guardrails: '' }
  try {
    const data = await getAppSettings()
    settings = {
      product_knowledge: data.product_knowledge ?? '',
      guardrails: data.guardrails ?? '',
    }
  } catch {
    // settings table may not exist yet — use defaults
  }

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure product knowledge and creative guardrails.
        </p>
      </div>

      {/* Client info — read only */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Client</h2>
        <div className="rounded-xl border border-border bg-card/50 p-4 space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Client name</p>
            <p className="text-sm mt-0.5">{quakeConfig.clientName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Brand context</p>
            <p className="text-sm mt-0.5 text-muted-foreground leading-relaxed whitespace-pre-line">
              {quakeConfig.brandContext}
            </p>
          </div>
        </div>
      </section>

      {/* ICPs — read only */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">ICPs ({quakeConfig.icps.length})</h2>
        <div className="space-y-2">
          {quakeConfig.icps.map(icp => (
            <div key={icp.id} className="rounded-lg border border-border bg-card/50 px-4 py-3">
              <p className="text-sm font-medium">{icp.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{icp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editable fields */}
      <SettingsForm
        initialProductKnowledge={settings.product_knowledge}
        initialGuardrails={settings.guardrails}
      />

      {/* Research engine — deferred */}
      <section className="space-y-2 opacity-50">
        <h2 className="text-sm font-semibold">Background research engine</h2>
        <div className="rounded-xl border border-dashed border-border p-4">
          <p className="text-sm text-muted-foreground">Coming in V1.1 — automatic insight mining from TripAdvisor, Reddit, and Meta ad comments.</p>
        </div>
      </section>
    </div>
  )
}
