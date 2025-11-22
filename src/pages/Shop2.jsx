// src/pages/Shop.jsx - MODERN CONVERSION-OPTIMIZED VERSION
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Minus, Star, Clock, Flame, Leaf, 
  ChevronRight, Filter, X, Check, ShoppingBag,
  Sparkles, TrendingUp, Award, Zap, Heart,
  Store, Truck, ChevronDown
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useMenu } from '../contexts/MenuContext';
import { useCatering } from '../contexts/CateringContext';
import ModifierModal from '../components/modifiers/ModifierModal';
import { productHasModifiers } from '../config/modifiers';
import toast from 'react-hot-toast';

export default function Shop() {
  const { products: menuItems = [], categories = [], loading } = useMenu();
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { isCateringOrder, setIsCateringOrder } = useCatering();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    vegetarian: false,
    spicy: false,
    popular: false
  });
  
  // Modifier modal state
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [modifierProduct, setModifierProduct] = useState(null);
  
  // Quick view modal
  const [quickViewItem, setQuickViewItem] = useState(null);
  
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
      // Catering filter
      if (isCateringOrder) {
        const isCateringItem = item.categories?.some(cat => 
          cat.slug === 'catering' || cat.name.toLowerCase().includes('catering')
        );
        if (!isCateringItem) return false;
      }
  
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(query) && 
            !item.description?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Category filter
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
  }, [menuItems, searchQuery, activeCategory, filters, isCateringOrder]);

  // Group items by category
  const itemsByCategory = useMemo(() => {
    if (activeCategory !== 'all') {
      return { [activeCategory]: filteredItems };
    }
    
    return filteredItems.reduce((acc, item) => {
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

  // Scroll to category
  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    if (categoryId !== 'all' && categoryRefs.current[categoryId]) {
      const yOffset = -180;
      const element = categoryRefs.current[categoryId];
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Quick add to cart
  const handleQuickAdd = (item, e) => {
    e.stopPropagation();
    
    if (productHasModifiers(item)) {
      setModifierProduct(item);
      setModifierModalOpen(true);
      return;
    }
    
    addToCart({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      image: item.images && item.images[0]?.src,
      quantity: 1
    });
    
    toast.success(
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4" />
        <span>Added {item.name}</span>
      </div>,
      {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      }
    );
  };

  // Handle adding item with modifiers
  const handleAddWithModifiers = (cartItem) => {
    addToCart(cartItem);
    toast.success(
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4" />
        <span>Added to cart</span>
      </div>,
      {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      }
    );
  };

  // Update quantity
  const handleQuantityChange = (item, newQuantity, e) => {
    e.stopPropagation();
    if (newQuantity <= 0) {
      updateQuantity(item.id, 0);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  // Loading state with skeleton
  if (loading && menuItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-masala-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-masala-200 rounded-xl w-64"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3] bg-masala-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-masala-200 rounded w-3/4"></div>
                    <div className="h-4 bg-masala-100 rounded"></div>
                    <div className="h-8 bg-masala-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-masala-50 via-white to-masala-50">
      {/* Hero Section - Premium & Inviting */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Authentic Indian & Himalayan Cuisine</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
            >
              Experience True
              <span className="block text-primary-200">Indian Flavors</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-primary-100 mb-8"
            >
              Fresh ingredients, traditional recipes, crafted with love. 
              Order online for pickup or catering.
            </motion.p>

            {/* Search Bar - Premium Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-2xl"
            >
              <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="w-5 h-5 text-masala-400" />
              </div>
              <input
                type="text"
                placeholder="Search dishes... (try 'butter chicken' or 'vegan')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-14 py-4 md:py-5 bg-white rounded-2xl text-masala-900 placeholder-masala-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl text-base md:text-lg transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-masala-400 hover:text-masala-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              
              {/* Search suggestions dropdown could go here */}
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 mt-8 text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                  ))}
                </div>
                <span className="text-primary-100">500+ 5-star reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-200" />
                <span className="text-primary-100">Ready in 20-30 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-200" />
                <span className="text-primary-100">Family-owned since 2015</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Order Type Toggle - Improved Design */}
      <div className="bg-white border-b shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsCateringOrder(false)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                !isCateringOrder
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                  : 'bg-masala-50 text-masala-600 hover:bg-masala-100'
              }`}
            >
              <Store className="w-5 h-5" />
              <span>Pickup</span>
              {!isCateringOrder && <Zap className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsCateringOrder(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isCateringOrder
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                  : 'bg-masala-50 text-masala-600 hover:bg-masala-100'
              }`}
            >
              <Truck className="w-5 h-5" />
              <span>Catering</span>
              <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full font-normal">
                $250 min
              </span>
            </button>
          </div>
          
          {/* Catering Info Banner */}
          <AnimatePresence>
            {isCateringOrder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl overflow-hidden"
              >
                <p className="text-sm text-primary-800 text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Catering includes delivery within 25 miles • Order 4+ hours in advance</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Category Navigation - Enhanced Sticky */}
      <div 
        ref={navRef}
        className="sticky top-32 z-30 bg-white/95 backdrop-blur-md border-b shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {/* Filter Button - Enhanced */}
            <button
              onClick={() => setFilterOpen(true)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                Object.values(filters).some(v => v)
                  ? 'bg-primary-500 border-primary-500 text-white shadow-lg'
                  : 'border-masala-200 text-masala-600 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {Object.values(filters).filter(v => v).length > 0 && (
                <span className="bg-white text-primary-600 px-1.5 py-0.5 rounded-full text-xs font-bold">
                  {Object.values(filters).filter(v => v).length}
                </span>
              )}
            </button>

            {/* All Category - Enhanced */}
            <button
              onClick={() => scrollToCategory('all')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-masala-50 text-masala-700 hover:bg-masala-100'
              }`}
            >
              All Dishes
            </button>

            {/* Category Pills - Enhanced */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-masala-50 text-masala-700 hover:bg-masala-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Active Filters Display - Enhanced */}
        {Object.entries(filters).some(([_, v]) => v) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6 flex-wrap"
          >
            <span className="text-sm font-medium text-masala-600">Filtering by:</span>
            {filters.vegetarian && (
              <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-sm">
                <Leaf className="w-3.5 h-3.5" />
                Vegetarian
                <button 
                  onClick={() => setFilters(f => ({...f, vegetarian: false}))}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {filters.spicy && (
              <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5" />
                Spicy
                <button 
                  onClick={() => setFilters(f => ({...f, spicy: false}))}
                  className="hover:bg-red-200 rounded-full p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {filters.popular && (
              <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-sm">
                <TrendingUp className="w-3.5 h-3.5" />
                Popular
                <button 
                  onClick={() => setFilters(f => ({...f, popular: false}))}
                  className="hover:bg-yellow-200 rounded-full p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <button
              onClick={() => setFilters({ vegetarian: false, spicy: false, popular: false })}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium underline decoration-dotted underline-offset-4"
            >
              Clear all
            </button>
          </motion.div>
        )}

        {/* Results Count - Enhanced */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl"
          >
            <p className="text-sm text-primary-800">
              <span className="font-semibold">{filteredItems.length}</span> {filteredItems.length === 1 ? 'dish' : 'dishes'} found for "{searchQuery}"
            </p>
          </motion.div>
        )}

        {/* Menu Items by Category - PREMIUM CARDS */}
        {Object.keys(itemsByCategory).length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-masala-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-masala-400" />
            </div>
            <h3 className="text-xl font-semibold text-masala-900 mb-2">No dishes found</h3>
            <p className="text-masala-500 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setFilters({ vegetarian: false, spicy: false, popular: false });
              }}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {Object.entries(itemsByCategory).map(([categoryId, categoryData]) => {
              const items = Array.isArray(categoryData) ? categoryData : categoryData.items;
              const categoryName = Array.isArray(categoryData) 
                ? categories.find(c => c.id === parseInt(categoryId))?.name || categoryId
                : categoryData.name;
              
              return (
                <div 
                  key={categoryId} 
                  ref={el => categoryRefs.current[categoryId] = el}
                >
                  {/* Category Header - Enhanced */}
                  {activeCategory === 'all' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between mb-6"
                    >
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-bold text-masala-900">
                          {categoryName}
                        </h2>
                        <span className="px-3 py-1 bg-masala-100 text-masala-600 rounded-full text-sm font-semibold">
                          {items.length}
                        </span>
                      </div>
                      <ChevronRight className="w-6 h-6 text-masala-400" />
                    </motion.div>
                  )}
                  
                  {/* Product Grid - PREMIUM CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item, index) => {
                      const quantity = getItemQuantity(item.id);
                      
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-masala-100 hover:border-primary-200 overflow-hidden transition-all duration-300 cursor-pointer"
                          onClick={() => setQuickViewItem(item)}
                        >
                          {/* Image Container - Enhanced */}
                          <div className="relative aspect-[4/3] bg-gradient-to-br from-masala-100 to-masala-50 overflow-hidden">
                            {item.images && item.images[0]?.src ? (
                              <img
                                src={item.images[0].src}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-16 h-16 text-masala-300" />
                              </div>
                            )}
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Badges - Premium Design */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                              {item.isPopular && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg"
                                >
                                  <Star className="w-3 h-3 fill-current" />
                                  POPULAR
                                </motion.span>
                              )}
                              <div className="flex gap-1.5">
                                {item.isVegetarian && (
                                  <span className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                    <Leaf className="w-4 h-4" />
                                  </span>
                                )}
                                {item.isSpicy && (
                                  <span className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                    <Flame className="w-4 h-4" />
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quick Add Button - Premium */}
                            <div className="absolute bottom-3 right-3">
                              <AnimatePresence mode="wait">
                                {quantity === 0 ? (
                                  <motion.button
                                    key="add"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => handleQuickAdd(item, e)}
                                    className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full shadow-2xl flex items-center justify-center"
                                  >
                                    <Plus className="w-6 h-6" />
                                  </motion.button>
                                ) : (
                                  <motion.div
                                    key="quantity"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="flex items-center gap-2 bg-white rounded-full shadow-2xl p-1.5"
                                  >
                                    <button
                                      onClick={(e) => handleQuantityChange(item, quantity - 1, e)}
                                      className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-masala-900">
                                      {quantity}
                                    </span>
                                    <button
                                      onClick={(e) => handleQuantityChange(item, quantity + 1, e)}
                                      className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* Content - Premium Typography */}
                          <div className="p-4">
                            <h3 className="font-bold text-masala-900 mb-2 line-clamp-1 text-lg group-hover:text-primary-600 transition-colors">
                              {item.name}
                            </h3>
                            
                            {(item.short_description || item.description) && (
                              <p 
                                className="text-sm text-masala-500 line-clamp-2 mb-3 leading-relaxed"
                                dangerouslySetInnerHTML={{ 
                                  __html: (item.short_description || item.description).replace(/<\/?p>/g, '') 
                                }}
                              />
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-2xl font-bold text-primary-600">
                                  ${parseFloat(item.price).toFixed(2)}
                                </span>
                                {item.prepTime && (
                                  <span className="text-xs text-masala-400 flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {item.prepTime} min
                                  </span>
                                )}
                              </div>
                              
                              {productHasModifiers(item) && (
                                <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
                                  <span>Customize</span>
                                  <ChevronRight className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Hover Indicator */}
                          <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
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

      {/* Filter Modal - Enhanced */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-masala-900">Filters</h3>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-2 hover:bg-masala-100 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-masala-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Dietary Preferences */}
                <div>
                  <h4 className="font-semibold text-masala-900 mb-4 text-lg">Dietary Preferences</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl cursor-pointer border-2 border-transparent hover:border-green-300 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-masala-900">Vegetarian</p>
                          <p className="text-sm text-masala-500">Plant-based dishes</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={filters.vegetarian}
                        onChange={(e) => setFilters(f => ({...f, vegetarian: e.target.checked}))}
                        className="w-6 h-6 rounded-lg border-masala-300 text-green-500 focus:ring-green-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl cursor-pointer border-2 border-transparent hover:border-red-300 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                          <Flame className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-masala-900">Spicy</p>
                          <p className="text-sm text-masala-500">Extra heat</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={filters.spicy}
                        onChange={(e) => setFilters(f => ({...f, spicy: e.target.checked}))}
                        className="w-6 h-6 rounded-lg border-masala-300 text-red-500 focus:ring-red-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Popularity */}
                <div>
                  <h4 className="font-semibold text-masala-900 mb-4 text-lg">Sort & Filter</h4>
                  <label className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl cursor-pointer border-2 border-transparent hover:border-yellow-300 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-masala-900">Popular Items Only</p>
                        <p className="text-sm text-masala-500">Customer favorites</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={filters.popular}
                      onChange={(e) => setFilters(f => ({...f, popular: e.target.checked}))}
                      className="w-6 h-6 rounded-lg border-masala-300 text-yellow-500 focus:ring-yellow-500"
                    />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t sticky bottom-0 bg-white">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setFilters({ vegetarian: false, spicy: false, popular: false });
                    }}
                    className="flex-1 py-4 border-2 border-masala-200 text-masala-700 rounded-xl font-semibold hover:bg-masala-50 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="flex-1 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all"
                  >
                    Show Results ({filteredItems.length})
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}{/* Quick View Modal - FIXED VERSION */}
      <AnimatePresence>
        {quickViewItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewItem(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed z-50 w-full max-w-2xl"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxHeight: '90vh',
              }}
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
                {/* Image */}
                <div className="relative w-full bg-gradient-to-br from-masala-100 to-masala-50 flex-shrink-0" style={{ height: '300px' }}>
                  {quickViewItem.images && quickViewItem.images[0]?.src ? (
                    <img
                      src={quickViewItem.images[0].src}
                      alt={quickViewItem.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-20 h-20 text-masala-300" />
                    </div>
                  )}
                  
                  <button
                    onClick={() => setQuickViewItem(null)}
                    className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white text-masala-900 rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {quickViewItem.isPopular && (
                      <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-sm font-bold rounded-full flex items-center gap-2 shadow-lg">
                        <Star className="w-4 h-4 fill-current" />
                        POPULAR
                      </span>
                    )}
                    <div className="flex gap-2">
                      {quickViewItem.isVegetarian && (
                        <span className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-full flex items-center gap-2 shadow-lg">
                          <Leaf className="w-4 h-4" />
                          Vegetarian
                        </span>
                      )}
                      {quickViewItem.isSpicy && (
                        <span className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full flex items-center gap-2 shadow-lg">
                          <Flame className="w-4 h-4" />
                          Spicy
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-masala-900 mb-2">
                        {quickViewItem.name}
                      </h2>
                      {quickViewItem.prepTime && (
                        <p className="text-sm text-masala-500 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Ready in {quickViewItem.prepTime} minutes
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-2xl md:text-3xl font-bold text-primary-600">
                        ${parseFloat(quickViewItem.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {(quickViewItem.short_description || quickViewItem.description) && (
                    <div 
                      className="text-masala-600 leading-relaxed text-sm md:text-base"
                      dangerouslySetInnerHTML={{ 
                        __html: quickViewItem.description || quickViewItem.short_description
                      }}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 md:p-6 border-t bg-gradient-to-br from-masala-50 to-white flex-shrink-0">
                  <button
                    onClick={(e) => {
                      if (productHasModifiers(quickViewItem)) {
                        setQuickViewItem(null);
                        setModifierProduct(quickViewItem);
                        setModifierModalOpen(true);
                      } else {
                        handleQuickAdd(quickViewItem, e);
                        setQuickViewItem(null);
                      }
                    }}
                    className="w-full py-4 md:py-5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
                  >
                    <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                    {productHasModifiers(quickViewItem) 
                      ? 'Customize & Add to Cart' 
                      : `Add to Cart • $${parseFloat(quickViewItem.price).toFixed(2)}`
                    }
                  </button>
                </div>
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