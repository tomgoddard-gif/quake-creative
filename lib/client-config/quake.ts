import type { ClientConfig } from './types'

export const quakeConfig: ClientConfig = {
  clientName: 'Quake',

  brandContext: `
Quake is an immersive earthquake experience in Belém, Lisbon, Portugal.
Visitors stand on a shaking platform inside a realistic recreation of a 1755-era Lisbon street and experience what the Great Earthquake felt like.
Entry price: €26 per adult.
Brand positioning: "Culture Shaker" — Recordar é Proteger (Remembering is Protecting).
Strategic triangle: History (authentic 1755 recreation) × Science (seismological rigour) × Experience (sensory immersion).
Two positioning modes:
- Tourists: "Where the city begins" — Quake as the essential prerequisite for understanding Lisbon
- Locals: "The preparation experience" — invaluable family investment in safety and awareness
Central narrative: Remembering the past protects the future. Visitors leave as prepared, resilient agents.
  `.trim(),

  productKnowledge: `
[Add Quake product knowledge here in Settings — USPs, key features, the simulator, RFID wristbands, pricing, location details, what makes Quake different from every other museum in Lisbon.]
  `.trim(),

  guardrails: [],

  icps: [
    {
      id: 'tourist_family',
      name: 'Tourist Family',
      description: 'Parents travelling with children aged 6–14. In Lisbon for 3–7 days. Culturally curious but also managing children\'s energy and attention spans.',
      frustration: 'Most attractions are either too adult or too childish. Hard to find something the whole family genuinely engages with.',
      desire: 'One experience the whole family talks about afterwards. The kids are genuinely amazed, not just entertained.',
      fear: 'Wasting money on something the kids will complain about or that will bore the adults.',
      objection: '€26 per adult is expensive when you\'re paying for a whole family.',
    },
    {
      id: 'tourist_older_couple',
      name: 'Tourist Older Couple (no kids)',
      description: 'Couple aged 50+, travelling without children. Interested in history, culture, and authentic experiences. Often doing a longer trip.',
      frustration: 'Standard tourist attractions feel shallow — queues, crowds, gift shops, no depth.',
      desire: 'To genuinely understand the city they\'re visiting. A story they can tell when they get home.',
      fear: 'Spending their limited time on something that doesn\'t live up to the promise.',
      objection: 'We\'ve been to a lot of museums. Is this actually different?',
    },
    {
      id: 'tourist_young_couple',
      name: 'Tourist Young Couple',
      description: 'Couple aged 25–40, in Lisbon for a city break. Looking for something more interesting than dinner and another viewpoint.',
      frustration: 'City breaks blur into the same restaurants and monuments. They want something that surprises them.',
      desire: 'A shared experience that actually connects them. A story to tell, not just photos to post.',
      fear: 'Looking stupid for suggesting something that turns out to be boring or cheesy.',
      objection: 'Is it just a museum? We\'ve seen enough museums.',
    },
    {
      id: 'local_family',
      name: 'Local Family',
      description: 'Lisbon residents with children. Portuguese. Sceptical about tourist-priced attractions in their own city.',
      frustration: 'Most "must-see" Lisbon attractions are designed for tourists, not for people who live here.',
      desire: 'Something that makes them proud of their city. An experience that teaches their kids about their own history in a way that sticks.',
      fear: 'Paying tourist prices for something their kids won\'t care about.',
      objection: 'We already know Lisbon. Why would we pay €26 to visit a museum about something we grew up hearing about?',
    },
    {
      id: 'local_older_couple',
      name: 'Local Older Couple (no kids)',
      description: 'Lisbon residents aged 50+, no children at home. Have cultural blindness to their own city\'s landmarks. Portuguese or long-term expats.',
      frustration: 'They think they already know everything worth knowing about Lisbon.',
      desire: 'To be genuinely surprised by their own city. To see something familiar through completely new eyes.',
      fear: 'Being made to feel like a tourist in their own city.',
      objection: 'I lived through the 1969 earthquake. I don\'t need a museum to tell me about earthquakes.',
    },
    {
      id: 'local_young_couple',
      name: 'Local Young Couple',
      description: 'Lisbon residents aged 25–40. Looking for something different to do on a date or weekend. Open to spending money on experiences.',
      frustration: 'Date night in Lisbon defaults to dinner and maybe a bar. There\'s nothing in the middle ground between restaurants and proper tourist attractions.',
      desire: 'A date they\'ll still be talking about next week. Something that makes them feel like they discovered something.',
      fear: 'Suggesting something their partner finds boring or uncool.',
      objection: 'Sounds like something for tourists. Is this actually for us?',
    },
  ],
}
