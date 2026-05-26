import { getTopPerformers, getFatigueAlerts } from '@/lib/data/meta'
import { FatigueBadge } from '@/components/admin/FatigueBadge'
import { TrendingUp, AlertTriangle } from 'lucide-react'

export default async function PerformancePage() {
  const [topPerformers, fatigueAlerts] = await Promise.all([
    getTopPerformers(5),
    getFatigueAlerts(),
  ])

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Performance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Pre-ideation Meta performance snapshot
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-medium">Top performers by CTR</h2>
        </div>
        {topPerformers.length === 0 ? (
          <EmptyState message="No performance data yet. Run a Meta sync to populate." />
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  {['Ad name', 'CTR', 'Frequency', 'Spend', 'CPA'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topPerformers.map(ad => (
                  <tr key={ad.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{ad.ad_name}</td>
                    <td className="px-4 py-3 text-emerald-400">
                      {ad.ctr != null ? `${(ad.ctr * 100).toFixed(2)}%` : '—'}
                    </td>
                    <td className="px-4 py-3">{ad.frequency?.toFixed(2) ?? '—'}</td>
                    <td className="px-4 py-3">
                      {ad.spend != null ? `€${ad.spend.toFixed(0)}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {ad.cpa != null ? `€${ad.cpa.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <h2 className="text-sm font-medium">Fatigue alerts</h2>
          <span className="text-xs text-muted-foreground">(frequency &gt; 3.5)</span>
        </div>
        {fatigueAlerts.length === 0 ? (
          <EmptyState message="No fatigue alerts. All active creatives are within healthy frequency." />
        ) : (
          <div className="space-y-2">
            {fatigueAlerts.map(ad => (
              <div key={ad.id} className="flex items-center justify-between rounded-lg border border-orange-500/20 bg-orange-500/5 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{ad.ad_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    CTR: {ad.ctr != null ? `${(ad.ctr * 100).toFixed(2)}%` : '—'} · Spend: {ad.spend != null ? `€${ad.spend.toFixed(0)}` : '—'}
                  </p>
                </div>
                {ad.frequency != null && <FatigueBadge frequency={ad.frequency} />}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
