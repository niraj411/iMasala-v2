// src/pages/Shop.jsx - Conversion-Optimized Version
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Minus, Star, Clock, Flame, Leaf, 
  ChevronRight, Filter, X, Check, ShoppingBag,
  Sparkles, TrendingUp
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useMenu } from '../contexts/MenuContext';
import ModifierModal from '../components/modifiers/ModifierModal';
import { productHasModifiers } from '../config/modifiers';
import toast from 'react-hot-toast';

export default function Shop() {
  const { products: menuItems = [], categories = [], loading } = useMenu();
  const { addToCart, cartItems, updateQuantity } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    vegetarian: false,
    spicy: false,
    popular: false
  });
  const [error, setError] = useState(null);
  
  // Modifier modal state
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [modifierProduct, setModifierProduct] = useState(null);
  
  // Modifier state

  const categoryRefs = useRef({});
  const navRef = useRef(null);

  // Get item quantity in cart
  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Filter and search items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(query) && 
            !item.description?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Category filter - WooCommerce products have categories as array of objects
      if (activeCategory !== 'all') {
        const hasCategory = item.categories?.some(cat => 
          cat.id === activeCategory || cat.slug === activeCategory || cat.id === parseInt(activeCategory)
        );
        if (!hasCategory) return false;
      }

      // Additional filters
      if (filters.vegetarian && !item.isVegetarian) return false;
      if (filters.spicy && !item.isSpicy) return false;
      if (filters.popular && !item.isPopular) return false;

      return true;
    });
  }, [menuItems, searchQuery, activeCategory, filters]);

  // Group items by category for display
  const itemsByCategory = useMemo(() => {
    if (activeCategory !== 'all') {
      return { [activeCategory]: filteredItems };
    }
    
    return filteredItems.reduce((acc, item) => {
      // WooCommerce products have categories as array of objects
      const primaryCategory = item.categories && item.categories[0];
      const catId = primaryCategory?.id || 'other';
      const catName = primaryCategory?.name || 'Other';
      
      if (!acc[catId]) {
        acc[catId] = { name: catName, items: [] };
      }
      acc[catId].items.push(item);
      return acc;
    }, {});
  }, [filteredItems, activeCategory]);

  // Handle category click with smooth scroll
  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    if (categoryId !== 'all' && categoryRefs.current[categoryId]) {
      const yOffset = -140; // Account for sticky header
      const element = categoryRefs.current[categoryId];
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Quick add to cart - checks for modifiers first
  const handleQuickAdd = (item, e) => {
    e.stopPropagation();
    
    // Check if product needs modifiers
    if (productHasModifiers(item)) {
      setModifierProduct(item);
      setModifierModalOpen(true);
      return;
    }
    
    // No modifiers needed, add directly
    addToCart({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      image: item.images && item.images[0]?.src,
      quantity: 1
    });
    toast.success(`${item.name} added!`, {
      icon: '🍽️',
      duration: 1500,
      position: 'bottom-center'
    });
  };

  // Handle adding item with modifiers from modal
  const handleAddWithModifiers = (cartItem) => {
    addToCart(cartItem);
    toast.success(`${cartItem.name} added!`, {
      icon: '🍽️',
      duration: 1500,
      position: 'bottom-center'
    });
  };

  // Update quantity directly from card
  const handleQuantityChange = (item, newQuantity, e) => {
    e.stopPropagation();
    if (newQuantity <= 0) {
      updateQuantity(item.id, 0);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  // Only show loading spinner if actually loading AND no products cached
  if (loading && menuItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-masala-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-masala-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Menu</h1>
          <p className="text-primary-100 mb-6">
            Authentic Indian flavors, made fresh daily
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-masala-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-masala-900 placeholder-masala-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-masala-400 hover:text-masala-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Category Navigation */}
      <div 
        ref={navRef}
        className="sticky top-16 z-30 bg-white border-b shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {/* Filter Button */}
            <button
              onClick={() => setFilterOpen(true)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                Object.values(filters).some(v => v)
                  ? 'bg-primary-50 border-primary-500 text-primary-600'
                  : 'border-masala-200 text-masala-600 hover:border-masala-300'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* All Category */}
            <button
              onClick={() => scrollToCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-masala-100 text-masala-600 hover:bg-masala-200'
              }`}
            >
              All
            </button>

            {/* Category Pills */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-masala-100 text-masala-600 hover:bg-masala-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Active Filters Display */}
        {Object.entries(filters).some(([_, v]) => v) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-masala-500">Active filters:</span>
            {filters.vegetarian && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Leaf className="w-3 h-3" />
                Vegetarian
                <button onClick={() => setFilters(f => ({...f, vegetarian: false}))}>
                  <X className="w-3 h-3 ml-1" />
                </button>
              </span>
            )}
            {filters.spicy && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Flame className="w-3 h-3" />
                Spicy
                <button onClick={() => setFilters(f => ({...f, spicy: false}))}>
                  <X className="w-3 h-3 ml-1" />
                </button>
              </span>
            )}
            {filters.popular && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Popular
                <button onClick={() => setFilters(f => ({...f, popular: false}))}>
                  <X className="w-3 h-3 ml-1" />
                </button>
              </span>
            )}
            <button
              onClick={() => setFilters({ vegetarian: false, spicy: false, popular: false })}
              className="text-xs text-primary-600 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        {searchQuery && (
          <p className="text-sm text-masala-500 mb-4">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </p>
        )}

        {/* Menu Items by Category */}
        {Object.keys(itemsByCategory).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-masala-500 mb-4">No items found</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setFilters({ vegetarian: false, spicy: false, popular: false });
              }}
              className="text-primary-600 font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(itemsByCategory).map(([categoryId, categoryData]) => {
              // Handle both old structure (array) and new structure (object with name/items)
              const items = Array.isArray(categoryData) ? categoryData : categoryData.items;
              const categoryName = Array.isArray(categoryData) 
                ? categories.find(c => c.id === parseInt(categoryId))?.name || categoryId
                : categoryData.name;
              
              return (
                <div 
                  key={categoryId} 
                  ref={el => categoryRefs.current[categoryId] = el}
                >
                  {activeCategory === 'all' && (
                    <h2 className="text-xl font-bold text-masala-900 mb-4 flex items-center gap-2">
                      {categoryName}
                      <span className="text-sm font-normal text-masala-500">
                        ({items.length})
                      </span>
                    </h2>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => {
                      const quantity = getItemQuantity(item.id);
                      
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl shadow-sm border border-masala-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => setSelectedItem(item)}
                        >
                          {/* Image */}
                          <div className="relative aspect-[4/3] bg-masala-100 overflow-hidden">
                            {item.images && item.images[0]?.src ? (
                              <img
                                src={item.images[0].src}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-masala-300">
                                <ShoppingBag className="w-12 h-12" />
                              </div>
                            )}
                            
                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                              {item.isPopular && (
                                <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                                  <Star className="w-3 h-3" fill="currentColor" />
                                  Popular
                                </span>
                              )}
                              {item.isVegetarian && (
                                <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">
                                  <Leaf className="w-3 h-3" />
                                </span>
                              )}
                              {item.isSpicy && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                                  <Flame className="w-3 h-3" />
                                </span>
                              )}
                            </div>

                            {/* Quick Add Button */}
                            <div className="absolute bottom-2 right-2">
                              {quantity === 0 ? (
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => handleQuickAdd(item, e)}
                                  className="w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center"
                                >
                                  <Plus className="w-5 h-5" />
                                </motion.button>
                              ) : (
                                <div className="flex items-center gap-1 bg-white rounded-full shadow-lg p-1">
                                  <button
                                    onClick={(e) => handleQuantityChange(item, quantity - 1, e)}
                                    className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-50 rounded-full"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-6 text-center font-semibold text-sm">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={(e) => handleQuantityChange(item, quantity + 1, e)}
                                    className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-50 rounded-full"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <h3 className="font-semibold text-masala-900 mb-1 line-clamp-1">
                              {item.name}
                            </h3>
                            {(item.short_description || item.description) && (
                              <p 
                                className="text-sm text-masala-500 line-clamp-2 mb-3"
                                dangerouslySetInnerHTML={{ 
                                  __html: (item.short_description || item.description).replace(/<\/?p>/g, '') 
                                }}
                              />
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary-600">
                                ${parseFloat(item.price).toFixed(2)}
                              </span>
                              {item.prepTime && (
                                <span className="text-xs text-masala-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.prepTime} min
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4 border-b sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-2 hover:bg-masala-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Dietary */}
                <div>
                  <h4 className="font-medium text-masala-900 mb-3">Dietary</h4>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-masala-50 rounded-lg cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-green-600" />
                        Vegetarian
                      </span>
                      <input
                        type="checkbox"
                        checked={filters.vegetarian}
                        onChange={(e) => setFilters(f => ({...f, vegetarian: e.target.checked}))}
                        className="w-5 h-5 rounded border-masala-300 text-primary-500 focus:ring-primary-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-masala-50 rounded-lg cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-red-600" />
                        Spicy
                      </span>
                      <input
                        type="checkbox"
                        checked={filters.spicy}
                        onChange={(e) => setFilters(f => ({...f, spicy: e.target.checked}))}
                        className="w-5 h-5 rounded border-masala-300 text-primary-500 focus:ring-primary-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Popularity */}
                <div>
                  <h4 className="font-medium text-masala-900 mb-3">Sort</h4>
                  <label className="flex items-center justify-between p-3 bg-masala-50 rounded-lg cursor-pointer">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-yellow-600" />
                      Popular items only
                    </span>
                    <input
                      type="checkbox"
                      checked={filters.popular}
                      onChange={(e) => setFilters(f => ({...f, popular: e.target.checked}))}
                      className="w-5 h-5 rounded border-masala-300 text-primary-500 focus:ring-primary-500"
                    />
                  </label>
                </div>
              </div>

              <div className="p-4 border-t sticky bottom-0 bg-white">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setFilters({ vegetarian: false, spicy: false, popular: false });
                    }}
                    className="flex-1 py-3 border border-masala-200 text-masala-600 rounded-xl font-medium"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Image */}
              <div className="relative aspect-video bg-masala-100 flex-shrink-0">
                {selectedItem.images && selectedItem.images[0]?.src ? (
                  <img
                    src={selectedItem.images[0].src}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-masala-300">
                    <ShoppingBag className="w-16 h-16" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-2xl font-bold text-masala-900">
                    {selectedItem.name}
                  </h2>
                  <span className="text-2xl font-bold text-primary-600">
                    ${parseFloat(selectedItem.price).toFixed(2)}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedItem.isPopular && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4" fill="currentColor" />
                      Popular
                    </span>
                  )}
                  {selectedItem.isVegetarian && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center gap-1">
                      <Leaf className="w-4 h-4" />
                      Vegetarian
                    </span>
                  )}
                  {selectedItem.isSpicy && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      Spicy
                    </span>
                  )}
                </div>

                {(selectedItem.short_description || selectedItem.description) && (
                  <p className="text-masala-600 mb-4" dangerouslySetInnerHTML={{ 
                    __html: selectedItem.short_description || selectedItem.description 
                  }} />
                )}

                {selectedItem.prepTime && (
                  <p className="text-sm text-masala-500 flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4" />
                    Prep time: {selectedItem.prepTime} minutes
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t bg-masala-50">
                <button
                  onClick={(e) => {
                    // Check if product needs modifiers
                    if (productHasModifiers(selectedItem)) {
                      setSelectedItem(null);
                      setModifierProduct(selectedItem);
                      setModifierModalOpen(true);
                    } else {
                      // Add directly
                      addToCart({
                        id: selectedItem.id,
                        name: selectedItem.name,
                        price: parseFloat(selectedItem.price),
                        image: selectedItem.images && selectedItem.images[0]?.src,
                        quantity: 1
                      });
                      toast.success(`${selectedItem.name} added!`, {
                        icon: '🍽️',
                        duration: 1500,
                        position: 'bottom-center'
                      });
                      setSelectedItem(null);
                    }
                  }}
                  className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {productHasModifiers(selectedItem) 
                    ? 'Customize & Add' 
                    : `Add to Order - $${parseFloat(selectedItem.price).toFixed(2)}`
                  }
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modifier Modal */}
      <ModifierModal
        product={modifierProduct}
        isOpen={modifierModalOpen}
        onClose={() => {
          setModifierModalOpen(false);
          setModifierProduct(null);
        }}
        onAddToCart={handleAddWithModifiers}
      />
    </div>
  );
}