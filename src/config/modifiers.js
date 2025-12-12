// src/config/modifiers.js
// 
// MODIFIER CONFIGURATION
// Edit this file to control which modifiers appear for which categories
//

/**
 * All available modifier groups
 * Each group has:
 * - id: unique identifier
 * - name: display name
 * - type: 'single' (pick one) or 'multiple' (pick many)
 * - required: whether customer must select
 * - options: array of choices with name, price, and optional icon
 */
export const modifierGroups = {
  protein: {
    id: 'protein',
    name: 'Protein Choice',
    type: 'single',
    required: true,
    options: [
      { id: 'tikka_chicken', name: 'Tikka Chicken [Grilled]', price: 1.50 },
      { id: 'chicken', name: 'Chicken', price: 1.00 },
      { id: 'vegetables', name: 'Vegetables', price: 0 },
      { id: 'organic_tofu', name: 'Organic Tofu', price: 1.00 },
      { id: 'paneer', name: 'Paneer', price: 1.00 },
      { id: 'lamb', name: 'Lamb', price: 3.00 },
      { id: 'shrimp', name: 'Shrimp', price: 3.00 },
    ]
  },

  // Kebob-specific proteins (for Tandoori Kitchen Kebobs)
  kebobProtein: {
    id: 'kebobProtein',
    name: 'Kebob Choice',
    type: 'single',
    required: true,
    options: [
      { id: 'tandoori_chicken_bone', name: 'Tandoori Chicken (w/ Bone)', price: 0 },
      { id: 'chicken_tikka', name: 'Chicken Tikka (Boneless)', price: 2.00 },
      { id: 'honey_chicken_tikka', name: 'Honey Chicken Tikka (Boneless)', price: 3.00 },
      { id: 'lamb_boneless', name: 'Lamb (Boneless)', price: 4.00 },
      { id: 'shrimp', name: 'Shrimp', price: 4.00 },
      { id: 'lamb_shrimp', name: 'Lamb (Boneless) & Shrimp', price: 5.00 },
      { id: 'mixed_grill', name: 'Mixed Grill (Chicken/Lamb/Shrimp)', price: 5.00 },
    ]
  },

  // Biryani-specific proteins
  biryaniProtein: {
    id: 'biryaniProtein',
    name: 'Biryani Protein',
    type: 'single',
    required: true,
    options: [
      { id: 'chicken', name: 'Chicken', price: 0 },
      { id: 'lamb', name: 'Lamb', price: 3.00 },
      { id: 'goat', name: 'Goat', price: 4.00 },
      { id: 'shrimp', name: 'Shrimp', price: 3.00 },
      { id: 'vegetable', name: 'Vegetable', price: 0 },
      { id: 'paneer', name: 'Paneer', price: 1.00 },
    ]
  },
  
  spiceLevel: {
    id: 'spiceLevel',
    name: 'Spice Level',
    type: 'single',
    required: true,
    options: [
      { id: 'mild', name: 'Mild', price: 0, icon: '🌶️' },
      { id: 'medium', name: 'Medium', price: 0, icon: '🌶️🌶️' },
      { id: 'spicy', name: 'Spicy', price: 0, icon: '🌶️🌶️🌶️' },
      { id: 'hot', name: 'Hot', price: 0, icon: '🌶️🌶️🌶️🌶️' },
      { id: 'extra_hot', name: 'Extra Hot', price: 0, icon: '🌶️🌶️🌶️🌶️🌶️' },
    ]
  },
  
  riceSubstitute: {
    id: 'riceSubstitute',
    name: 'Substitute Rice?',
    type: 'single',
    required: false,
    options: [
      { id: 'no_change', name: 'No change', price: 0 },
      { id: 'no_rice', name: 'No rice', price: 0 },
      { id: 'brown_rice', name: 'Organic Brown Rice', price: 1.00 },
      { id: 'naan', name: 'Naan', price: 2.00 },
      { id: 'garlic_naan', name: 'Garlic Naan', price: 2.50 },
    ]
  },
  
  // Add more modifier groups here as needed
  // Example:
  // extras: {
  //   id: 'extras',
  //   name: 'Add Extras',
  //   type: 'multiple',
  //   required: false,
  //   options: [
  //     { id: 'extra_sauce', name: 'Extra Sauce', price: 0.50 },
  //     { id: 'extra_cheese', name: 'Extra Cheese', price: 1.00 },
  //   ]
  // }
};

/**
 * Category to modifier mapping
 * 
 * Key: Category slug or name (must match your WooCommerce category)
 * Value: Array of modifier group IDs that apply to this category
 * 
 * Products in categories not listed here will have NO modifiers
 * and will add directly to cart.
 */
export const categoryModifiers = {
  // ===========================================
  // FULL MODIFIERS (protein + spice + rice)
  // ===========================================
  'traditional-entrees': ['protein', 'spiceLevel', 'riceSubstitute'],
  'curry': ['protein', 'spiceLevel', 'riceSubstitute'],
  'curries': ['protein', 'spiceLevel', 'riceSubstitute'],
  'rice-bowls': ['protein', 'spiceLevel', 'riceSubstitute'],
  'bowls': ['protein', 'spiceLevel', 'riceSubstitute'],
  
  // ===========================================
  // KEBOBS (kebob protein + spice)
  // ===========================================
  'tandoori-kitchen-kebobs': ['kebobProtein', 'spiceLevel'],
  'tandoori-kitchen-kebabs': ['kebobProtein', 'spiceLevel'],
  'kebobs': ['kebobProtein', 'spiceLevel'],
  'kebabs': ['kebobProtein', 'spiceLevel'],
  'tandoori-kebobs': ['kebobProtein', 'spiceLevel'],
  'tandoori-kebabs': ['kebobProtein', 'spiceLevel'],

  // ===========================================
  // BIRYANI (biryani protein + spice)
  // ===========================================
  'biryani': ['biryaniProtein', 'spiceLevel'],
  'biryanis': ['biryaniProtein', 'spiceLevel'],
  
  // ===========================================
  // SPICE LEVEL ONLY
  // ===========================================
  'tandoori': ['spiceLevel'],
  'vegetarian-entrees': ['spiceLevel'],
  'vegetarian': ['spiceLevel'],
  'specialties': ['spiceLevel'],
  'seasonal-items': ['spiceLevel'],
  'seasonal': ['spiceLevel'],
  
  // ===========================================
  // NO MODIFIERS (add directly to cart)
  // ===========================================
  // 'appetizers': [],
  // 'drinks': [],
  // 'desserts': [],
  // 'sides': [],
  // 'breads': [],
};

/**
 * Helper function to get modifiers for a product
 * @param {Object} product - WooCommerce product object
 * @returns {Array} Array of modifier group objects that apply to this product
 */
export function getProductModifiers(product) {
  if (!product || !product.categories || product.categories.length === 0) {
    return [];
  }
  
  // Check each category the product belongs to
  for (const category of product.categories) {
    const slug = category.slug?.toLowerCase();
    const name = category.name?.toLowerCase();
    
    // Check if category has modifiers defined
    const modifierIds = categoryModifiers[slug] || categoryModifiers[name];
    
    if (modifierIds && modifierIds.length > 0) {
      // Return the full modifier group objects
      return modifierIds
        .map(id => modifierGroups[id])
        .filter(Boolean);
    }
  }
  
  return [];
}

/**
 * Helper function to check if a product needs modifiers
 * @param {Object} product - WooCommerce product object
 * @returns {Boolean}
 */
export function productHasModifiers(product) {
  return getProductModifiers(product).length > 0;
}

/**
 * Calculate total price of selected modifiers
 * @param {Object} selections - Object mapping modifier group ID to selected option(s)
 * @returns {Number} Total additional price
 */
export function calculateModifierPrice(selections) {
  let total = 0;
  
  for (const [groupId, selection] of Object.entries(selections)) {
    const group = modifierGroups[groupId];
    if (!group) continue;
    
    if (group.type === 'multiple' && Array.isArray(selection)) {
      // Multiple selections
      for (const optionId of selection) {
        const option = group.options.find(o => o.id === optionId);
        if (option) total += option.price;
      }
    } else {
      // Single selection
      const option = group.options.find(o => o.id === selection);
      if (option) total += option.price;
    }
  }
  
  return total;
}

/**
 * Format selected modifiers for display
 * @param {Object} selections - Object mapping modifier group ID to selected option(s)
 * @returns {String} Formatted string for cart/order display
 */
export function formatModifierSelections(selections) {
  const parts = [];
  
  for (const [groupId, selection] of Object.entries(selections)) {
    const group = modifierGroups[groupId];
    if (!group) continue;
    
    if (group.type === 'multiple' && Array.isArray(selection)) {
      const names = selection
        .map(optionId => group.options.find(o => o.id === optionId)?.name)
        .filter(Boolean);
      if (names.length) parts.push(names.join(', '));
    } else {
      const option = group.options.find(o => o.id === selection);
      if (option) {
        parts.push(option.icon ? `${option.name} ${option.icon}` : option.name);
      }
    }
  }
  
  return parts.join(' • ');
}