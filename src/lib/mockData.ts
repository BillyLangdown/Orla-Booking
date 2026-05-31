import type { Tenant, Resource, AvailabilitySlot, Booking } from '@/types'

// ─── Tenants ─────────────────────────────────────────────────────────────────

export const mockTenants: Tenant[] = [
  {
    id: 'tenant_001',
    slug: 'demo',
    name: 'City Training Studio',
    description: 'Professional training sessions in central London. Beginner through to advanced.',
    phone: '020 7123 4567',
    email: 'info@citytrainingstudio.co.uk',
    address: '12 Studio Lane, London, EC1A 1AA',
    branding: {
      primaryColor: '#1e293b',
      accentColor: '#6366f1',
    },
    intakeQuestions: [],
    onboardingCompleted: true,
    autoConfirm: true,
  },
]

// ─── Resources ───────────────────────────────────────────────────────────────

export const mockResources: Resource[] = [
  { id: 'res_001', tenantId: 'tenant_001', name: 'Alex Turner', type: 'person' },
  { id: 'res_002', tenantId: 'tenant_001', name: 'Sarah Okafor', type: 'person' },
  { id: 'res_003', tenantId: 'tenant_001', name: 'Studio A', type: 'asset' },
  { id: 'res_004', tenantId: 'tenant_001', name: 'Studio B', type: 'asset' },
]

// ─── Availability Slots ───────────────────────────────────────────────────────
// Dates are relative to today so the demo always shows upcoming slots.

function dateFromNow(daysAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().split('T')[0]
}

export const mockSlots: AvailabilitySlot[] = [
  {
    id: 'slot_001',
    tenantId: 'tenant_001',
    resourceId: 'res_001',
    resource: { id: 'res_001', tenantId: 'tenant_001', name: 'Alex Turner', type: 'person' },
    sessionType: 'Beginner',
    date: dateFromNow(1),
    startTime: '09:00',
    endTime: '12:00',
    capacity: 3,
    booked: 1,
  },
  {
    id: 'slot_002',
    tenantId: 'tenant_001',
    resourceId: 'res_002',
    resource: { id: 'res_002', tenantId: 'tenant_001', name: 'Sarah Okafor', type: 'person' },
    sessionType: 'Beginner',
    date: dateFromNow(1),
    startTime: '13:00',
    endTime: '16:00',
    capacity: 3,
    booked: 0,
  },
  {
    id: 'slot_003',
    tenantId: 'tenant_001',
    resourceId: 'res_001',
    resource: { id: 'res_001', tenantId: 'tenant_001', name: 'Alex Turner', type: 'person' },
    sessionType: 'Intermediate',
    date: dateFromNow(2),
    startTime: '09:00',
    endTime: '12:00',
    capacity: 2,
    booked: 0,
  },
  {
    id: 'slot_004',
    tenantId: 'tenant_001',
    resourceId: 'res_002',
    resource: { id: 'res_002', tenantId: 'tenant_001', name: 'Sarah Okafor', type: 'person' },
    sessionType: 'Advanced',
    date: dateFromNow(3),
    startTime: '10:00',
    endTime: '14:00',
    capacity: 2,
    booked: 1,
  },
  {
    id: 'slot_005',
    tenantId: 'tenant_001',
    resourceId: 'res_001',
    resource: { id: 'res_001', tenantId: 'tenant_001', name: 'Alex Turner', type: 'person' },
    sessionType: 'Private',
    date: dateFromNow(4),
    startTime: '09:00',
    endTime: '17:00',
    capacity: 1,
    booked: 0,
  },
  {
    id: 'slot_006',
    tenantId: 'tenant_001',
    resourceId: 'res_002',
    resource: { id: 'res_002', tenantId: 'tenant_001', name: 'Sarah Okafor', type: 'person' },
    sessionType: 'Refresher',
    date: dateFromNow(5),
    startTime: '13:00',
    endTime: '17:00',
    capacity: 2,
    booked: 0,
  },
]

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const mockBookings: Booking[] = [
  {
    id: 'booking_001',
    tenantId: 'tenant_001',
    slotId: 'slot_001',
    name: 'James Carter',
    email: 'james.carter@email.com',
    sessionType: 'Beginner',
    notes: 'First time attending. Coming from a complete beginner background.',
    intakeAnswers: {},
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'confirmed',
  },
  {
    id: 'booking_002',
    tenantId: 'tenant_001',
    slotId: 'slot_004',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    sessionType: 'Advanced',
    intakeAnswers: {},
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'confirmed',
  },
]
