import { supabase } from '../lib/supabase'

/**
 * Demo seed script for hackathon use.
 * Inserts eight demo reports covering categories, languages, severities,
 * statuses and AI review flags. Safe to run repeatedly: removes only previous demo reports.
 */
export async function seedDemoReports(): Promise<void> {
  const descriptions: Array<{
    description: string
    category: string
    severity: string
    status: string
    location_text: string
    summary: string
    language: string
    needs_review: boolean
    forward_message: string | null
  }> = [
    {
      description: '[DEMO] Illegal dumping of refuse behind Unity Primary School in Ikole town centre.',
      category: 'waste',
      severity: 'high',
      status: 'in_progress',
      location_text: 'Ikole-Ekiti, behind Unity Primary School',
      summary: 'Refuse dumping blocking open drainage behind Unity Primary School.',
      language: 'en',
      needs_review: false,
      forward_message: 'Please arrange refuse evacuation at Unity Primary School.',
    },
    {
      description: '[DEMO] Flooded road after heavy rain near the Federal Polytechnic gate in Oye.',
      category: 'drainage',
      severity: 'urgent',
      status: 'pending',
      location_text: 'Oye-Ekiti, near Federal Polytechnic gate',
      summary: 'Standing water caused by blocked culvert after rainfall.',
      language: 'pcm',
      needs_review: true,
      forward_message: 'Please inspect and clear the culvert before the next rainfall.',
    },
    {
      description: '[DEMO] Pothole on the road to the hostel affecting two-wheelers in Ikole.',
      category: 'road',
      severity: 'medium',
      status: 'resolved',
      location_text: 'Ikole-Ekiti, near Federal Polytechnic hostel',
      summary: 'Deep pothole reported on road to hostel.',
      language: 'yo',
      needs_review: false,
      forward_message: 'Road maintenance scheduled for the hostel road.',
    },
    {
      description: '[DEMO] Streetlight not working along Old Ekiti Road in Oye.',
      category: 'streetlight',
      severity: 'low',
      status: 'pending',
      location_text: 'Oye-Ekiti, Old Ekiti Road',
      summary: 'Streetlight reported out along Old Ekiti Road.',
      language: 'en',
      needs_review: false,
      forward_message: 'Please inspect the streetlight at Old Ekiti Road.',
    },
    {
      description: '[DEMO] Power outage affecting a neighbourhood in Ikole.',
      category: 'power_outage',
      severity: 'urgent',
      status: 'forwarded',
      location_text: 'Ikole-Ekiti, Aiyetoro area',
      summary: 'Power outage reported in Aiyetoro area of Ikole.',
      language: 'pcm',
      needs_review: true,
      forward_message: 'Please dispatch a crew to Aiyetoro.',
    },
    {
      description: '[DEMO] Water shortage reported at a hostel facility in Oye.',
      category: 'water',
      severity: 'medium',
      status: 'in_progress',
      location_text: 'Oye-Ekiti, hostel area',
      summary: 'Water supply shortage at hostel facility.',
      language: 'yo',
      needs_review: false,
      forward_message: 'Please prioritise water supply at the hostel.',
    },
    {
      description: '[DEMO] Waste collection point overflowing in Ikole.',
      category: 'waste',
      severity: 'low',
      status: 'pending',
      location_text: 'Ikole-Ekiti, market road',
      summary: 'Waste collection point reported overflowing.',
      language: 'en',
      needs_review: false,
      forward_message: 'Please schedule waste collection.',
    },
    {
      description: '[DEMO] Broken bore hole at a hostel facility in Oye.',
      category: 'hostel_facility',
      severity: 'high',
      status: 'resolved',
      location_text: 'Oye-Ekiti, hostel facility',
      summary: 'Bore hole reported broken at hostel facility.',
      language: 'en',
      needs_review: false,
      forward_message: 'Please repair the bore hole.',
    },
  ]

  for (const demo of descriptions) {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        description: demo.description,
        category: demo.category,
        severity: demo.severity,
        location_text: demo.location_text,
        summary: demo.summary,
        language: demo.language,
        needs_review: demo.needs_review,
        forward_message: demo.forward_message,
        status: demo.status,
      })
      .select()
      .single()
    if (error) {
      throw new Error(`Seed insert failed: ${error.message}`)
    }
    await supabase.from('status_history').insert({
      report_id: data.id,
      old_status: null,
      new_status: demo.status,
      updated_by: null,
      note: 'Demo report',
    })
  }
}
