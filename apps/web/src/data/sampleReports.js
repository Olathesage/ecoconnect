/**
 * EcoConnect Ekiti - Shared domain constants and sample data
 *
 * Mirrors the shared API contract used by the backend:
 * - category: waste | drainage | road | water | streetlight | power_outage | hostel_facility | other
 * - severity: low | medium | high | urgent
 * - status: pending | forwarded | in_progress | resolved
 * - language: en | yo | pcm
 */

export const CATEGORIES = [
  { value: 'waste', label: 'Waste' },
  { value: 'drainage', label: 'Drainage' },
  { value: 'road', label: 'Road' },
  { value: 'water', label: 'Water' },
  { value: 'streetlight', label: 'Streetlight' },
  { value: 'power_outage', label: 'Power Outage' },
  { value: 'hostel_facility', label: 'Hostel Facility' },
  { value: 'other', label: 'Other' },
]

export const SEVERITIES = ['low', 'medium', 'high', 'urgent']

export const STATUSES = ['pending', 'forwarded', 'in_progress', 'resolved']

export const STATUS_LABELS = {
  pending: 'Pending',
  forwarded: 'Forwarded',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

export const STATUS_FLOW = ['pending', 'forwarded', 'in_progress', 'resolved']

export const SAMPLE_REPORTS = [
  {
    id: '1',
    reference: 'ECO-0001',
    category: 'waste',
    severity: 'high',
    status: 'in_progress',
    location_text: 'Ikole-Ekiti, behind Unity Primary School',
    description:
      'There is an accumulation of refuse in the open drainage channel behind Unity Primary School. Residents have been dumping waste there for weeks.',
    summary:
      'Open refuse pile blocking a drainage channel behind Unity Primary School; likely contributing to flooding.',
    language: 'en',
    needs_review: false,
    detected_issue: 'Illegal dumping of household waste into open drainage',
    reason: 'Refuse accumulation observed at the reported location with visible drainage blockage.',
    review_reason: null,
    forward_message:
      'Please arrange refuse evacuation and drainage clearance at Unity Primary School immediately.',
    submittedAt: '2026-10-28T09:14:00Z',
  },
  {
    id: '2',
    reference: 'ECO-0002',
    category: 'drainage',
    severity: 'urgent',
    status: 'pending',
    location_text: 'Oye-Ekiti, along Old Ekiti Road',
    description:
      'The culvert under Old Ekiti Road is choked with silt and plastic waste; water has not drained for two days.',
    summary:
      'Silt and plastic blockage in road culvert at Old Ekiti Road causing standing water.',
    language: 'pcm',
    needs_review: true,
    detected_issue: 'Blocked culvert with silt and debris',
    reason: 'Drainage blockage suspected from standing water after heavy rain.',
    review_reason: 'Verify blockage with on-site inspection before dispatch.',
    forward_message:
      'Please inspect the culvert at Old Ekiti Road and clear silt before the next rainfall.',
    submittedAt: '2026-10-30T16:42:00Z',
  },
  {
    id: '3',
    reference: 'ECO-0003',
    category: 'road',
    severity: 'medium',
    status: 'resolved',
    location_text: 'Ikole-Ekiti, near Federal Polytechnic gate',
    description: 'The road leading to the Federal Polytechnic gate has a deep pothole affecting two-wheelers.',
    summary: 'Deep pothole reported on road to Federal Polytechnic gate.',
    language: 'en',
    needs_review: false,
    detected_issue: 'Road surface pothole',
    reason: 'Pothole observed during community patrol.',
    review_reason: null,
    forward_message: 'Please schedule road maintenance at Federal Polytechnic gate.',
    submittedAt: '2026-10-21T07:55:00Z',
  },
]
