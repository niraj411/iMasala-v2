// src/config/categoryImages.js
//
// Default images for product categories when products don't have their own image
// Update these URLs with actual images from your media library or CDN
//

// Base URL for placeholder images (can be replaced with actual hosted images)
const PLACEHOLDER_BASE = 'https://tandoorikitchenco.com/wp-content/uploads';

// Default category images mapping
// Key: category slug (lowercase)
// Value: image URL
export const categoryDefaultImages = {
  // ============================================
  // CATERING CATEGORIES
  // ============================================
  'catering': `${PLACEHOLDER_BASE}/2024/01/catering-default.jpg`,
  'catering-packages': `${PLACEHOLDER_BASE}/2024/01/catering-packages.jpg`,
  'catering-beverages': `${PLACEHOLDER_BASE}/2024/01/beverages.jpg`,
  'catering-appetizers': `${PLACEHOLDER_BASE}/2024/01/appetizers.jpg`,
  'catering-kebobs': `${PLACEHOLDER_BASE}/2024/01/kebobs.jpg`,
  'catering-chicken': `${PLACEHOLDER_BASE}/2024/01/chicken.jpg`,
  'catering-lamb': `${PLACEHOLDER_BASE}/2024/01/lamb.jpg`,
  'catering-seafood': `${PLACEHOLDER_BASE}/2024/01/seafood.jpg`,
  'catering-vegetarian': `${PLACEHOLDER_BASE}/2024/01/vegetarian.jpg`,
  'catering-vegan': `${PLACEHOLDER_BASE}/2024/01/vegan.jpg`,
  'catering-biryani': `${PLACEHOLDER_BASE}/2024/01/biryani.jpg`,
  'catering-noodles-rice': `${PLACEHOLDER_BASE}/2024/01/noodles-rice.jpg`,
  'catering-breads': `${PLACEHOLDER_BASE}/2024/01/breads.jpg`,
  'catering-chutneys-extras': `${PLACEHOLDER_BASE}/2024/01/chutneys.jpg`,
  'catering-desserts': `${PLACEHOLDER_BASE}/2024/01/desserts.jpg`,

  // ============================================
  // REGULAR MENU CATEGORIES
  // ============================================
  'appetizers': `${PLACEHOLDER_BASE}/2024/01/appetizers.jpg`,
  'traditional-entrees': `${PLACEHOLDER_BASE}/2024/01/entrees.jpg`,
  'curries': `${PLACEHOLDER_BASE}/2024/01/curry.jpg`,
  'curry': `${PLACEHOLDER_BASE}/2024/01/curry.jpg`,
  'tandoori-kitchen-kebobs': `${PLACEHOLDER_BASE}/2024/01/kebobs.jpg`,
  'kebobs': `${PLACEHOLDER_BASE}/2024/01/kebobs.jpg`,
  'biryani': `${PLACEHOLDER_BASE}/2024/01/biryani.jpg`,
  'rice-bowls': `${PLACEHOLDER_BASE}/2024/01/rice-bowls.jpg`,
  'vegetarian-entrees': `${PLACEHOLDER_BASE}/2024/01/vegetarian.jpg`,
  'vegetarian': `${PLACEHOLDER_BASE}/2024/01/vegetarian.jpg`,
  'breads': `${PLACEHOLDER_BASE}/2024/01/breads.jpg`,
  'naan': `${PLACEHOLDER_BASE}/2024/01/breads.jpg`,
  'sides': `${PLACEHOLDER_BASE}/2024/01/sides.jpg`,
  'desserts': `${PLACEHOLDER_BASE}/2024/01/desserts.jpg`,
  'drinks': `${PLACEHOLDER_BASE}/2024/01/beverages.jpg`,
  'beverages': `${PLACEHOLDER_BASE}/2024/01/beverages.jpg`,
  'seasonal-items': `${PLACEHOLDER_BASE}/2024/01/seasonal.jpg`,
  'specialties': `${PLACEHOLDER_BASE}/2024/01/specialties.jpg`,
};

// Fallback image when no category match is found
export const DEFAULT_PRODUCT_IMAGE = `${PLACEHOLDER_BASE}/2024/01/default-food.jpg`;

// Emoji fallbacks for when images fail to load (used as last resort)
export const categoryEmojis = {
  'catering-packages': '🍱',
  'catering-beverages': '🥤',
  'catering-appetizers': '🥟',
  'catering-kebobs': '🍢',
  'catering-chicken': '🍗',
  'catering-lamb': '🍖',
  'catering-seafood': '🦐',
  'catering-vegetarian': '🥗',
  'catering-vegan': '🌱',
  'catering-biryani': '🍚',
  'catering-noodles-rice': '🍜',
  'catering-breads': '🫓',
  'catering-chutneys-extras': '🫙',
  'catering-desserts': '🍮',
  'appetizers': '🥟',
  'curries': '🍛',
  'kebobs': '🍢',
  'biryani': '🍚',
  'vegetarian': '🥗',
  'breads': '🫓',
  'desserts': '🍮',
  'drinks': '🥤',
  'default': '🍽️',
};

/**
 * Get the default image URL for a product based on its categories
 * @param {Object} product - WooCommerce product object
 * @returns {string} Image URL
 */
export function getDefaultImageForProduct(product) {
  if (!product?.categories || product.categories.length === 0) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  // Check each category for a matching default image
  for (const category of product.categories) {
    const slug = category.slug?.toLowerCase();
    if (slug && categoryDefaultImages[slug]) {
      return categoryDefaultImages[slug];
    }
  }

  return DEFAULT_PRODUCT_IMAGE;
}

/**
 * Get the emoji fallback for a product based on its categories
 * @param {Object} product - WooCommerce product object
 * @returns {string} Emoji character
 */
export function getEmojiForProduct(product) {
  if (!product?.categories || product.categories.length === 0) {
    return categoryEmojis.default;
  }

  for (const category of product.categories) {
    const slug = category.slug?.toLowerCase();
    if (slug && categoryEmojis[slug]) {
      return categoryEmojis[slug];
    }
  }

  return categoryEmojis.default;
}
