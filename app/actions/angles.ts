'use server'

import { redirect } from 'next/navigation'
import { createAngle, saveAngleFields } from '@/lib/data/angles-data'
import { createConcept as dbCreateConcept, saveConceptFields } from '@/lib/data/plans'
import type { EntryPoint } from '@/lib/types'

export type AngleDraftFields = {
  title: string
  angle_narrative: string
  core_message: string
  pain_point: string
  benefit: string
  desired_response: string
  test_axis: string
}

export async function createAngleAction(params: {
  icp_id: string
  entry_point: EntryPoint
  idea_seed?: string
}): Promise<never> {
  // Create the angle record
  const angleId = await createAngle({ icp_id: params.icp_id })

  // Create the concept linked to the angle
  const conceptId = await dbCreateConcept({
    icp_id: params.icp_id,
    entry_point: params.entry_point,
    idea_seed: params.idea_seed,
  })

  // Link concept to angle
  await saveConceptFields(conceptId, { angle_id: angleId })

  redirect(`/plan/${conceptId}`)
}

export async function confirmAngleAction(
  angleId: string,
  conceptId: string,
  fields: AngleDraftFields,
): Promise<void> {
  // Save all angle fields and mark as confirmed
  await saveAngleFields(angleId, {
    title: fields.title,
    angle_narrative: fields.angle_narrative,
    core_message: fields.core_message,
    pain_point: fields.pain_point,
    benefit: fields.benefit,
    desired_response: fields.desired_response,
    test_axis: fields.test_axis,
    status: 'confirmed',
  })

  // Update the concept: mark concept_confirmed, advance to stage 2
  await saveConceptFields(conceptId, {
    title: fields.title,
    status: 'concept_confirmed',
    plan_stage: 2,
  })
}
