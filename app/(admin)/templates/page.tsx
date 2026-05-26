import { HOOK_TYPES, ANGLE_TYPES } from '@/lib/constants'

const HOOK_DESCRIPTIONS: Record<string, { mechanic: string; bestFor: string; ctr: string }> = {
  'Result-First':         { mechanic: 'Show the climax — viewer backtracks mentally', bestFor: 'Revelation, Story', ctr: '3.5–4.5%' },
  'Open Loop':            { mechanic: 'Incomplete statement forces watch-through', bestFor: 'FOMO, Education', ctr: '3.0–4.0%' },
  'Identity Challenge':   { mechanic: 'Challenges self-perception, creates knowledge gap', bestFor: 'Identity, Contrast', ctr: '3.0–4.0%' },
  '60-Second Contract':   { mechanic: '"Give me 60 seconds" — low ask, sunk-cost', bestFor: 'Problem-Solution', ctr: '2.5–3.5%' },
  'Before/During/After':  { mechanic: 'Calm → escalation → aftermath arc', bestFor: 'Story, Problem-Solution', ctr: '2.5–3.5%' },
  'Three Levels/Tiered':  { mechanic: 'Progress bar in viewer\'s mind', bestFor: 'Education, Value', ctr: '2.5–3.0%' },
  'Insider/Authority':    { mechanic: 'Mundane info reframed as exclusive', bestFor: 'Insider, Revelation', ctr: '2.0–3.0%' },
  'Value Stack':          { mechanic: 'Running total builds perceived value', bestFor: 'Problem-Solution', ctr: '2.0–3.0%' },
  'Direct Call-Out':      { mechanic: 'Speak directly to a specific person or behaviour', bestFor: 'Identity, Social Proof', ctr: '2.5–3.5%' },
  'Anti-Ad / Deadpan':    { mechanic: 'Deliberate undersell creates curiosity', bestFor: 'Revelation', ctr: '2.0–3.0%' },
  'Escalation':           { mechanic: 'Progressive tension build without resolution until payoff', bestFor: 'Revelation, Emotional', ctr: '2.5–3.5%' },
}

const ANGLE_DESCRIPTIONS: Record<string, { frame: string; bestPersonas: string }> = {
  'Problem-Solution':   { frame: '"You have this frustration → Quake solves it"', bestPersonas: 'Tourist, Family' },
  'Social Proof':       { frame: '"People like you love this"', bestPersonas: 'Couple, Tourist' },
  'Revelation/Contrast': { frame: '"You think X — but actually Y"', bestPersonas: 'Local, Couple' },
  'FOMO/Urgency':       { frame: '"You\'re in Lisbon and you\'re missing this"', bestPersonas: 'Tourist IN' },
  'Insider':            { frame: '"Most people walk past this — but not you"', bestPersonas: 'Local, Solo' },
  'Story/Narrative':    { frame: '"This happened to someone just like you"', bestPersonas: 'All' },
  'Identity Challenge': { frame: '"This is who you think you are"', bestPersonas: 'Local' },
  'Education':          { frame: '"Here\'s something you genuinely didn\'t know"', bestPersonas: 'Family, Educator' },
  'Identity':           { frame: 'Calls out a specific behaviour or self-image', bestPersonas: 'Local, Couple' },
  'Revelation':         { frame: 'Reframes something already known in a new light', bestPersonas: 'Tourist, Local' },
}

export default function TemplatesPage() {
  return (
    <div className="p-6 space-y-10">
      <div>
        <h1 className="text-xl font-semibold">Templates & Reference</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Hook types, angles, and platform specs</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Hook Types</h2>
        <p className="text-sm text-muted-foreground">
          Ranked by Quake account performance. CTR ranges are Meta Reels benchmarks for tourism.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {HOOK_TYPES.map((type, i) => {
            const info = HOOK_DESCRIPTIONS[type]
            return (
              <div key={type} className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/50">#{i + 1}</span>
                  <span className="text-sm font-semibold">{type}</span>
                  {info?.ctr && (
                    <span className="ml-auto text-xs text-emerald-400">{info.ctr}</span>
                  )}
                </div>
                {info && (
                  <>
                    <p className="text-xs text-muted-foreground">{info.mechanic}</p>
                    <p className="text-[11px] text-muted-foreground/60">Best for: {info.bestFor}</p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Angle Types</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ANGLE_TYPES.map(type => {
            const info = ANGLE_DESCRIPTIONS[type]
            return (
              <div key={type} className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <span className="text-sm font-semibold">{type}</span>
                {info && (
                  <>
                    <p className="text-xs text-muted-foreground italic">{info.frame}</p>
                    <p className="text-[11px] text-muted-foreground/60">Best personas: {info.bestPersonas}</p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Platform Specs</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {['Platform', 'Format', 'Duration', 'Hook window', 'Key rule'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PLATFORM_SPECS.map(row => (
                <tr key={row.platform} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{row.platform}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.format}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.duration}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.hookWindow}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{row.keyRule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

const PLATFORM_SPECS = [
  { platform: 'Meta Reels', format: '9:16', duration: '15–60s', hookWindow: '3s', keyRule: 'Captions always on' },
  { platform: 'Meta Feed', format: '4:5 or 1:1', duration: 'Up to 60s', hookWindow: '3s', keyRule: 'Primary text ≤125 chars' },
  { platform: 'TikTok', format: '9:16', duration: '15–60s', hookWindow: '2s', keyRule: 'No watermarks; UGC feel' },
  { platform: 'Google PMax', format: 'Various', duration: 'Static', hookWindow: 'N/A', keyRule: 'Headline ≤30 chars' },
  { platform: 'YouTube Skip', format: '16:9', duration: '15–30s', hookWindow: '5s', keyRule: 'Brand before skip' },
  { platform: 'YouTube Bumper', format: '16:9', duration: '6s max', hookWindow: 'Entire ad', keyRule: 'One message only' },
]
