export const APPROVAL_DATA = {
  standard: {
    patientId:  'PAT-001',
    drugName:   'Amoxicillin',
    dosage:     '500mg',
    duration:   '7',
    indication: 'Bacterial sinusitis',
    notes:      'Standard antibiotic — no special review needed',
  },

  highAntimicrobial: {
    patientId:        'PAT-002',
    drugName:         'Vancomycin',
    dosage:           '1000mg',
    duration:         '14',
    indication:       'MRSA bacteremia',
    notes:            'High-risk antimicrobial — requires ID review',
    justification:    'Blood cultures confirmed MRSA; beta-lactam resistance detected',
    requiresIDConsult: true,
  },

  urgent: {
    patientId:  'PAT-003',
    drugName:   'Meropenem',
    dosage:     '1g',
    duration:   '10',
    indication: 'Sepsis — ICU patient',
    notes:      'Urgent approval required',
    priority:   'urgent',
  },
};

// An approval that already exists in the system — used for review/approve/reject tests
export const EXISTING_APPROVAL_ID = 'APR-1001';
