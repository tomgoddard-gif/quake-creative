export interface ICP {
  id: string
  name: string
  description: string
  frustration: string
  desire: string
  fear: string
  objection: string
}

export interface ClientConfig {
  clientName: string
  brandContext: string
  productKnowledge: string
  guardrails: string[]
  icps: ICP[]
}
