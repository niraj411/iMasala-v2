// src/config/delivery.js
//
// Delivery configuration for catering orders
// Update this file to manage delivery zones and fees
//

// Valid delivery zip codes for catering
// These are the zip codes within our delivery radius
export const VALID_DELIVERY_ZIP_CODES = [
  // Boulder / Broomfield Area
  '80026', '80027', '80301', '80302', '80303', '80304', '80305', '80306',
  '80307', '80308', '80309', '80310', '80314',

  // Longmont / Niwot Area
  '80501', '80502', '80503', '80504', '80513', '80514', '80516', '80520',
  '80530', '80533', '80542', '80544',

  // Westminster / Thornton / Northglenn Area
  '80020', '80021', '80023', '80031', '80038', '80229', '80233', '80234',
  '80241', '80260', '80602', '80614', '80640',

  // Arvada / Wheat Ridge / Golden Area
  '80002', '80003', '80004', '80005', '80006', '80007', '80033', '80212',
  '80214', '80215', '80216', '80221', '80402',

  // Lakewood / Denver West Area
  '80001', '80024', '80025', '80030', '80033', '80034', '80035', '80036',
  '80037', '80211',

  // Denver Metro
  '80202', '80205', '80257', '80265', '80266', '80294', '80299',

  // Erie / Frederick / Firestone Area
  '80504', '80516', '80520', '80530', '80601', '80621',

  // Mountain Areas
  '80455', '80471',
];

// Delivery fee for catering orders
export const CATERING_DELIVERY_FEE = 20.00;

// Minimum order for catering
export const CATERING_MINIMUM_ORDER = 250.00;

// Maximum delivery radius in miles (for reference)
export const MAX_DELIVERY_RADIUS_MILES = 25;

/**
 * Check if a zip code is within our delivery area
 * @param {string} zipCode - The zip code to check
 * @returns {boolean} True if we deliver to this zip code
 */
export function isValidDeliveryZipCode(zipCode) {
  if (!zipCode) return false;
  // Normalize the zip code (remove spaces, take first 5 digits)
  const normalizedZip = zipCode.toString().trim().slice(0, 5);
  return VALID_DELIVERY_ZIP_CODES.includes(normalizedZip);
}

/**
 * Get a formatted list of delivery areas for display
 * @returns {string[]} Array of area descriptions
 */
export function getDeliveryAreas() {
  return [
    'Boulder & Broomfield',
    'Longmont & Niwot',
    'Westminster, Thornton & Northglenn',
    'Arvada, Wheat Ridge & Golden',
    'Lakewood & Denver West',
    'Denver Metro',
    'Erie, Frederick & Firestone',
  ];
}
