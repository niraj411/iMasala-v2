// src/config/delivery.js
//
// Delivery configuration for catering orders
// Update this file to manage delivery zones and fees
//

// ============================================
// DELIVERY ZONES WITH TIERED PRICING
// ============================================

// Zone 1: Local area - $20 delivery fee
// Boulder, Broomfield, Westminster, Longmont nearby
export const ZONE_1_ZIP_CODES = [
  '80020', '80021', '80023', '80026', '80027', '80038',
  '80234', '80301', '80303', '80304', '80305', '80306',
  '80307', '80308', '80309', '80310', '80314', '80502',
  '80514', '80516', '80544',
];

// Zone 2: Extended area - $30 delivery fee
// Denver Metro, Arvada, Lakewood, further areas
export const ZONE_2_ZIP_CODES = [
  // Westminster / Thornton / Northglenn (extended)
  '80031', '80229', '80233', '80241', '80260', '80602', '80614', '80640',

  // Boulder (extended)
  '80302',

  // Longmont / Niwot (extended)
  '80501', '80503', '80504', '80513', '80520', '80530', '80533', '80542',

  // Arvada / Wheat Ridge / Golden Area
  '80002', '80003', '80004', '80005', '80006', '80007', '80033', '80212',
  '80214', '80215', '80216', '80221', '80402',

  // Lakewood / Denver West Area
  '80001', '80024', '80025', '80030', '80034', '80035', '80036', '80037', '80211',

  // Denver Metro
  '80202', '80205', '80257', '80265', '80266', '80294', '80299',

  // Erie / Frederick / Firestone Area
  '80601', '80621',

  // Mountain Areas
  '80455', '80471',
];

// Delivery fees by zone
export const DELIVERY_FEES = {
  ZONE_1: 20.00,  // Local area
  ZONE_2: 30.00,  // Extended area
};

// Legacy export for backwards compatibility
export const CATERING_DELIVERY_FEE = DELIVERY_FEES.ZONE_1;

// Minimum order for catering
export const CATERING_MINIMUM_ORDER = 250.00;

// Maximum delivery radius in miles (for reference)
export const MAX_DELIVERY_RADIUS_MILES = 25;

// All valid delivery zip codes (combined)
export const VALID_DELIVERY_ZIP_CODES = [...ZONE_1_ZIP_CODES, ...ZONE_2_ZIP_CODES];

/**
 * Check if a zip code is within our delivery area
 * @param {string} zipCode - The zip code to check
 * @returns {boolean} True if we deliver to this zip code
 */
export function isValidDeliveryZipCode(zipCode) {
  if (!zipCode) return false;
  const normalizedZip = zipCode.toString().trim().slice(0, 5);
  return VALID_DELIVERY_ZIP_CODES.includes(normalizedZip);
}

/**
 * Get the delivery zone for a zip code
 * @param {string} zipCode - The zip code to check
 * @returns {number|null} Zone number (1 or 2) or null if not in delivery area
 */
export function getDeliveryZone(zipCode) {
  if (!zipCode) return null;
  const normalizedZip = zipCode.toString().trim().slice(0, 5);

  if (ZONE_1_ZIP_CODES.includes(normalizedZip)) return 1;
  if (ZONE_2_ZIP_CODES.includes(normalizedZip)) return 2;
  return null;
}

/**
 * Get the delivery fee for a zip code
 * @param {string} zipCode - The zip code to check
 * @returns {number} Delivery fee amount, or 0 if not in delivery area
 */
export function getDeliveryFee(zipCode) {
  const zone = getDeliveryZone(zipCode);
  if (zone === 1) return DELIVERY_FEES.ZONE_1;
  if (zone === 2) return DELIVERY_FEES.ZONE_2;
  return 0;
}

/**
 * Get delivery zone info for display
 * @param {string} zipCode - The zip code to check
 * @returns {object} Zone info with fee and description
 */
export function getDeliveryZoneInfo(zipCode) {
  const zone = getDeliveryZone(zipCode);

  if (zone === 1) {
    return {
      zone: 1,
      fee: DELIVERY_FEES.ZONE_1,
      description: 'Local Delivery Zone',
      isValid: true,
    };
  }

  if (zone === 2) {
    return {
      zone: 2,
      fee: DELIVERY_FEES.ZONE_2,
      description: 'Extended Delivery Zone',
      isValid: true,
    };
  }

  return {
    zone: null,
    fee: 0,
    description: 'Outside delivery area',
    isValid: false,
  };
}

/**
 * Get a formatted list of delivery areas for display
 * @returns {object[]} Array of zone descriptions with fees
 */
export function getDeliveryAreas() {
  return [
    {
      zone: 1,
      fee: DELIVERY_FEES.ZONE_1,
      areas: ['Boulder', 'Broomfield', 'Westminster', 'Superior', 'Louisville', 'Lafayette'],
    },
    {
      zone: 2,
      fee: DELIVERY_FEES.ZONE_2,
      areas: ['Denver Metro', 'Arvada', 'Lakewood', 'Golden', 'Thornton', 'Longmont'],
    },
  ];
}
