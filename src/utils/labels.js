export const CATEGORY_LABELS = { professional: 'Professional', retail: 'Retail' };

export const ROLE_LABELS = { owner: 'Owner', manager: 'Manager', stylist: 'Stylist', other: 'Other' };

export const MOVEMENT_LABELS = {
  opening: 'Opening',
  purchase: 'Purchase',
  used: 'Used',
  sold: 'Sold',
  damaged: 'Damaged',
  count_adjustment: 'Count adjustment',
};

// Take Out reasons, in the order shown on the Scan page
export const TAKE_OUT_REASONS = [
  { value: 'used', label: 'Used in service' },
  { value: 'sold', label: 'Sold' },
  { value: 'damaged', label: 'Damaged' },
];

export const SCAN_MODES = [
  { value: 'in', label: 'Stock In', hint: 'Deliveries' },
  { value: 'out', label: 'Take Out', hint: 'Used · sold · damaged' },
  { value: 'count', label: 'Count', hint: 'Stock count' },
];

export const CATEGORY_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'retail', label: 'Retail' },
];

export const COUNT_STATUS_LABELS = { open: 'Open', closed: 'Closed', cancelled: 'Cancelled' };
