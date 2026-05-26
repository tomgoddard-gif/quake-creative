# Quake Creative — Brand Rules & AI Generation Guide

## What Is Quake

Quake is a simulated earthquake experience in Lisbon, Portugal. Visitors stand on a shaking platform inside a realistic recreation of a 1755-era Lisbon street and experience what the Great Earthquake felt like. It is a cultural, educational, and emotionally resonant attraction — not a thrill ride.

Quake's creative is produced by Accelerate. All briefs follow the Accelerate Creative Ladder.

---

## The Accelerate Creative Ladder

Every brief is built bottom-up through five layers:

1. **Persona** — who we're speaking to (Tourist IN, Local PT, Couple, Family)
2. **Insight** — the true emotional truth about that person; something they feel but haven't said
3. **Angle** — the strategic frame that connects the insight to Quake
4. **Hook** — the first 3 seconds: the specific device that stops the scroll
5. **Brief** — the full production document: copy, visual direction, shot list, CTA

Each layer informs the next. Never skip layers.

---

## Personas

### P1 — Tourist in Lisbon
Culturally curious, already exploring the city. 25–45. Looking for something authentic beyond the guidebook trail. Doesn't want to waste limited time on something generic.

### P2 — Lisbon Local
Lives in Lisbon. Has cultural blindness to their own city's landmarks. Wants to be the person who knows the most unusual thing to do. Sceptical about paying tourist prices.

### P3 — Family
Parents with children aged 6–14. Wants one experience the whole family genuinely talks about afterwards. Fears wasting money on something the kids will complain about.

### P4 — Couple
Two people looking for something more interesting than dinner and a movie. One person usually drives the decision. Wants a shared experience that actually connects them.

---

## Hook Types (ranked by Quake account performance)

1. **Result-First** — show the climax, viewer backtracks mentally
2. **Open Loop** — incomplete statement forces watch-through
3. **Identity Challenge** — challenges self-perception, creates a knowledge gap
4. **60-Second Contract** — low ask, creates sunk-cost commitment
5. **Before/During/After** — calm → escalation → aftermath arc
6. **Three Levels/Tiered** — progress bar in the viewer's mind
7. **Insider/Authority** — mundane info reframed as exclusive
8. **Value Stack** — running total builds perceived value
9. **Direct Call-Out** — speaks directly to a specific person or behaviour
10. **Anti-Ad / Deadpan** — deliberate undersell creates curiosity
11. **Escalation** — progressive tension without resolution until payoff

---

## Angle Types

- **Problem-Solution** — "You have this frustration → Quake solves it"
- **Social Proof** — "People like you love this"
- **Revelation/Contrast** — "You think X — but actually Y"
- **FOMO/Urgency** — "You're in Lisbon and you're missing this"
- **Insider** — "Most people walk past this — but not you"
- **Story/Narrative** — "This happened to someone just like you"
- **Identity Challenge** — "This is who you think you are"
- **Education** — "Here's something you genuinely didn't know"
- **Identity** — calls out a specific behaviour or self-image
- **Revelation** — reframes something already known in a new light

---

## Tone Guidelines

- Direct and confident — never hedging or vague
- Emotionally grounded — insights come from a real emotional truth, not a marketing cliché
- Specific over generic — "1755 Lisbon" beats "historic earthquake", "3 minutes" beats "a short time"
- The experience is visceral but tasteful — it's not a horror attraction
- Portuguese cultural identity is a feature, not a backdrop — treat Lisbon with respect
- Never: cheesy superlatives, exclamation marks in copy, "Come experience…" openings

---

## Output Format for AI Generation

When generating insights, angles, or hooks, return exactly 3 options as a JSON array:

```json
[
  {
    "content": "The insight, angle, or hook text itself",
    "rationale": "Why this works for the persona and fits the Quake brand"
  }
]
```

No markdown. No explanatory text outside the JSON. Exactly 3 items. Each `content` should be concise (1–3 sentences max). Each `rationale` should be 1 sentence.
