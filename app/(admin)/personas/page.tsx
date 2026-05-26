import { getPersonas } from '@/lib/data/personas'
import { CAMPAIGN_LABELS } from '@/lib/constants'

export default async function PersonasPage() {
  const personas = await getPersonas()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Personas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{personas.length} personas</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {personas.map(persona => (
          <div key={persona.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[var(--quake)]">{persona.id}</span>
              <h2 className="text-base font-semibold">{persona.name}</h2>
            </div>

            {persona.who_they_are && (
              <p className="text-sm text-muted-foreground leading-relaxed">{persona.who_they_are}</p>
            )}

            <dl className="grid grid-cols-1 gap-2 text-sm">
              {persona.core_frustration && (
                <Row label="Frustration" value={persona.core_frustration} />
              )}
              {persona.core_desire && <Row label="Desire" value={persona.core_desire} />}
              {persona.core_fear && <Row label="Fear" value={persona.core_fear} />}
              {persona.objection && <Row label="Objection" value={persona.objection} />}
              {persona.trigger && <Row label="Trigger" value={persona.trigger} />}
              {persona.cpa_benchmark && <Row label="CPA" value={persona.cpa_benchmark} />}
            </dl>

            <div className="flex flex-wrap gap-1.5">
              {persona.campaign_fit?.map(c => (
                <span key={c} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  {CAMPAIGN_LABELS[c] ?? c}
                </span>
              ))}
              {persona.language?.map(l => (
                <span key={l} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                  {l}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60 pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-foreground/80">{value}</dd>
    </div>
  )
}
