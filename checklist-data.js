/*
  CHECKLIST_TEMPLATE
  Defines the structure of the showing checklist that appears inside every
  expanded tile. Each item/field has a stable `id` used as the storage key
  for that listing's saved state.
*/
const CHECKLIST_TEMPLATE = {
  metaFields: [
    { id: 'address', label: 'Address / Unit', type: 'text' },
    { id: 'date', label: 'Date', type: 'date' },
    { id: 'broker', label: 'Broker', type: 'text' },
    { id: 'phone', label: 'Phone', type: 'tel' },
    { id: 'size', label: 'Size (sq ft)', type: 'text' },
    { id: 'netRent', label: 'Net rent $/sf', type: 'text' },
    { id: 'tmi', label: 'TMI $/sf', type: 'text' },
    { id: 'allIn', label: 'Est. ALL-IN $/month', type: 'text' },
    { id: 'zoning', label: 'Zoning', type: 'text' }
  ],
  sections: [
    {
      title: 'BEFORE YOU LEAVE HOME — skip the trip if any fail',
      style: 'navy',
      items: [
        { id: 'b1', label: '<b>Size confirmed 1,500–3,000 sq ft in writing</b>' },
        { id: 'b2', label: 'Net rent + TMI received — all-in estimate calculated above' },
        { id: 'b3', label: '<b>Zoning checked on city map — C / CR / MU family</b>' },
        { id: 'b4', label: 'Landlord pays commission + nothing to sign at showing — confirmed' },
        { id: 'b5', label: 'One-broker rule clear: no other broker introduced this address' }
      ]
    },
    {
      title: 'INSIDE — DEALBREAKERS FIRST',
      style: 'red',
      items: [
        { id: 'i1', label: '<b>WASHROOM(S) IN UNIT</b> — none = walk out.', dealbreaker: true, field: { placeholder: 'How many' } },
        { id: 'i2', label: '<b>ELECTRICAL PANEL — PHOTOGRAPH IT.</b>', dealbreaker: true, field: { placeholder: 'Main breaker amps' } },
        { id: 'i3', label: 'Need 200A+ for 30 rigs.', field: { placeholder: 'Spare breaker slots' } },
        { id: 'i4', label: '<b>Condition:</b>', condition: ['Move-in ready', 'Light reno', 'SHELL (= pass unless landlord TI)'] },
        { id: 'i5', label: 'Ceiling height (9 ft min):', field: { placeholder: 'height' } },
        { id: 'i6', label: 'Columns / layout open enough for station rows + VR zone' }
      ]
    },
    {
      title: 'OUTSIDE THE UNIT',
      style: 'navy',
      items: [
        { id: 'o1', label: 'Street visibility — seen from road?', field: { placeholder: 'From how far' } },
        { id: 'o2', label: 'Signage — facade / pylon rights?', field: { placeholder: 'Where' } },
        { id: 'o3', label: 'Entrance — direct from outside, or shared corridor / mall?', field: { placeholder: 'Details' } },
        { id: 'o4', label: 'Parking — # spots:', field: { placeholder: 'count' } },
        { id: 'o5', label: 'Neighbours — food nearby? Residential above (noise)? Vacancies?' },
        { id: 'o6', label: '<b>Evening test: would a 19-year-old feel safe arriving at 11 pm?</b>' }
      ]
    }
  ]
};
