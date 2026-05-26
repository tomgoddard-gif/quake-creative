'use server'

import { updateAppSettings } from '@/lib/data/settings'

export async function saveSettingsAction(fields: {
  product_knowledge?: string
  guardrails?: string
}): Promise<void> {
  await updateAppSettings(fields)
}
