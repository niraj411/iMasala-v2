// src/pages/Shop.jsx - ORGANIZED VERSION
// 
// CHANGES MADE:
// 1. Filter out "Uncategorized" from category nav
// 2. Filter out "Uncategorized" from product groupings  
// 3. Added displayCategories memo for cleaner filtering
// 4. Products in "Uncategorized" still show under "All" view
//

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Minus, Star, Clock, Flame, Leaf,
  ChevronRight, ChevronDown, ChevronUp, Filter, X, Check, ShoppingBag,
  Sparkles, TrendingUp, Award, Zap, Store, Truck, ArrowUp,
  SortAsc, Grid3X3, List, DollarSign
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useMenu } from '../contexts/MenuContext';
import { useCatering } from '../contexts/CateringContext';
import ModifierModal from '../components/modifiers/ModifierModal';
import VariationModal from '../components/modifiers/VariationModal';
import { productHasModifiers } from '../config/modifiers';
import { getDefaultImageForProduct, getEmojiForProduct } from '../config/categoryImages';
import toast from 'react-hot-toast';

// Helper to check if product is a WooCommerce variable product
const isVariableProduct = (product) => {
  return product.type === 'variable' &&
         ((product.variations && product.variations.length > 0) ||
          (product.attributes && product.attributes.some(attr => attr.variation)));
};

export default function Shop() {
  const { products: menuItems = [], categories = [], loading } = useMenu() || {};
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
  
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [modifierProduct, setModifierProduct] = useState(null);
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [variationProduct, setVariationProduct] = useState(null);
  const [quickViewItem, setQuickViewItem] = useState(null);

  // New UX state
  const [sortBy, setSortBy] = useState('default'); // default, price-low, price-high, name, popular
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentVisibleCategory, setCurrentVisibleCategory] = useState('all');

  const categoryRefs = useRef({});
  const sortDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // Handle scroll events for back-to-top button and progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      setShowBackToTop(scrollY > 500);
      setScrollProgress(progress);

      // Determine current visible category
      const categoryIds = Object.keys(categoryRefs.current);
      for (let i = categoryIds.length - 1; i >= 0; i--) {
        const el = categoryRefs.current[categoryIds[i]];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 250) {
            setCurrentVisibleCategory(categoryIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (quickViewItem) setQuickViewItem(null);
        if (filterOpen) setFilterOpen(false);
        if (modifierModalOpen) {
          setModifierModalOpen(false);
          setModifierProduct(null);
        }
        if (variationModalOpen) {
          setVariationModalOpen(false);
          setVariationProduct(null);
        }
        if (sortDropdownOpen) setSortDropdownOpen(false);
        if (categoryDropdownOpen) setCategoryDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewItem, filterOpen, modifierModalOpen, variationModalOpen, sortDropdownOpen, categoryDropdownOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset active category when switching between pickup/catering modes
  useEffect(() => {
    setActiveCategory('all');
  }, [isCateringOrder]);

  // ============================================
  // Filter categories based on mode (catering vs pickup)
  // ============================================
  const displayCategories = useMemo(() => {
    return categories.filter(cat => {
      // Always filter out uncategorized
      if (cat.slug === 'uncategorized' || cat.name.toLowerCase() === 'uncategorized') {
        return false;
      }

      // Check if category is a catering category
      const isCateringCategory =
        cat.slug?.includes('catering') ||
        cat.name.toLowerCase().includes('catering');

      // In catering mode: only show catering categories
      if (isCateringOrder) {
        return isCateringCategory;
      }

      // In pickup mode: exclude catering categories
      return !isCateringCategory;
    });
  }, [categories, isCateringOrder]);

  // Calculate item counts per category (considering catering mode)
  const categoryItemCounts = useMemo(() => {
    const counts = { all: 0 };
    menuItems.forEach(item => {
      const isCateringItem = item.categories?.some(cat =>
        cat.slug === 'catering' ||
        cat.slug === 'catering-trays' ||
        cat.name.toLowerCase().includes('catering')
      );

      // Skip items that don't match current mode
      if (isCateringOrder && !isCateringItem) return;
      if (!isCateringOrder && isCateringItem) return;

      counts.all++;
      item.categories?.forEach(cat => {
        if (cat.slug !== 'uncategorized' && cat.name.toLowerCase() !== 'uncategorized') {
          counts[cat.id] = (counts[cat.id] || 0) + 1;
        }
      });
    });
    return counts;
  }, [menuItems, isCateringOrder]);

  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Sort options configuration
  const sortOptions = [
    { value: 'default', label: 'Default', icon: Grid3X3 },
    { value: 'popular', label: 'Most Popular', icon: TrendingUp },
    { value: 'price-low', label: 'Price: Low to High', icon: DollarSign },
    { value: 'price-high', label: 'Price: High to Low', icon: DollarSign },
    { value: 'name', label: 'Name: A-Z', icon: SortAsc },
  ];

  const filteredItems = useMemo(() => {
    let items = menuItems.filter(item => {
      // Check if item is a catering item
      const isCateringItem = item.categories?.some(cat =>
        cat.slug === 'catering' ||
        cat.slug === 'catering-trays' ||
        cat.name.toLowerCase().includes('catering')
      );

      if (isCateringOrder) {
        // In catering mode: ONLY show catering items
        if (!isCateringItem) return false;
      } else {
        // In regular pickup mode: EXCLUDE catering items
        if (isCateringItem) return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(query) &&
            !item.description?.toLowerCase().includes(query)) {
          return false;
        }
      }

      if (activeCategory !== 'all') {
        const hasCategory = item.categories?.some(cat =>
          cat.id === activeCategory || cat.slug === activeCategory || cat.id === parseInt(activeCategory)
        );
        if (!hasCategory) return false;
      }

      if (filters.vegetarian && !item.isVegetarian) return false;
      if (filters.spicy && !item.isSpicy) return false;
      if (filters.popular && !item.isPopular) return false;

      return true;
    });

    // Apply sorting
    if (sortBy !== 'default') {
      items = [...items].sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return parseFloat(a.price) - parseFloat(b.price);
          case 'price-high':
            return parseFloat(b.price) - parseFloat(a.price);
          case 'name':
            return a.name.localeCompare(b.name);
          case 'popular':
            // Popular items first
            if (a.isPopular && !b.isPopular) return -1;
            if (!a.isPopular && b.isPopular) return 1;
            return 0;
          default:
            return 0;
        }
      });
    }

    return items;
  }, [menuItems, searchQuery, activeCategory, filters, isCateringOrder, sortBy]);

  // ============================================
  // UPDATED: Skip Uncategorized in groupings
  // ============================================
  const itemsByCategory = useMemo(() => {
    if (activeCategory !== 'all') {
      return { [activeCategory]: filteredItems };
    }
    
    const grouped = filteredItems.reduce((acc, item) => {
      // Find the first non-uncategorized category
      const validCategory = item.categories?.find(cat => 
        cat.slug !== 'uncategorized' && 
        cat.name.toLowerCase() !== 'uncategorized'
      );
      
      // If no valid category, use the first one or 'other'
      const primaryCategory = validCategory || (item.categories && item.categories[0]);
      const catId = primaryCategory?.id || 'other';
      const catName = primaryCategory?.name || 'Other';
      
      // Skip if it's uncategorized (items will show but not under uncategorized header)
      if (catName.toLowerCase() === 'uncategorized') {
        return acc;
      }
      
      if (!acc[catId]) {
        acc[catId] = { name: catName, items: [], order: primaryCategory?.menu_order || 999 };
      }
      acc[catId].items.push(item);
      return acc;
    }, {});

    // Sort categories by menu_order if available
    const sortedEntries = Object.entries(grouped).sort((a, b) => {
      return (a[1].order || 999) - (b[1].order || 999);
    });

    return Object.fromEntries(sortedEntries);
  }, [filteredItems, activeCategory]);

  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    if (categoryId !== 'all' && categoryRefs.current[categoryId]) {
      const yOffset = -200;
      const element = categoryRefs.current[categoryId];
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (item, e) => {
    e.stopPropagation();

    // Check for WooCommerce variable products first (catering items)
    if (isVariableProduct(item)) {
      setVariationProduct(item);
      setVariationModalOpen(true);
      return;
    }

    // Check for config-based modifiers (regular menu items)
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

    toast.success(item.name, {
      icon: '✓',
      duration: 2000,
      position: 'bottom-center',
      style: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
    });
  };

  const handleAddWithModifiers = (cartItem) => {
    addToCart(cartItem);
    toast.success('Added to cart', {
      icon: '✓',
      duration: 2000,
      position: 'bottom-center',
      style: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
    });
  };

  const handleAddWithVariation = (cartItem) => {
    addToCart(cartItem);
    const displayName = cartItem.variationName
      ? `${cartItem.name} (${cartItem.variationName})`
      : cartItem.name;
    toast.success(displayName, {
      icon: '✓',
      duration: 2000,
      position: 'bottom-center',
      style: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
    });
  };

  const handleQuantityChange = (item, newQuantity, e) => {
    e.stopPropagation();
    if (newQuantity <= 0) {
      updateQuantity(item.id, 0);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  if (loading && menuItems.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-white/10 rounded-2xl w-64"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10">
                  <div className="aspect-square bg-white/5"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-white/10 rounded-xl w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded-lg"></div>
                    <div className="h-8 bg-white/10 rounded-xl w-24"></div>
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
    <div className="min-h-screen bg-black">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/50 z-[100]">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
          style={{ width: `${scrollProgress}%` }}
          initial={{ width: 0 }}
        />
      </div>

      {/* Hero Section - Premium Dark with Glassmorphism */}
      <div className="relative bg-gradient-to-b from-zinc-950 via-black to-black overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full text-sm font-medium text-white/90 mb-8"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Authentic Indian & Himalayan Cuisine</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="text-white">Crafted for</span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                Perfection
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto"
            >
              Experience authentic flavors with modern convenience
            </motion.p>

            {/* Search Bar - Glass Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl opacity-20 group-hover:opacity-30 blur transition duration-500"></div>
                <div className="relative flex items-center">
                  <Search className="absolute left-6 w-5 h-5 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all text-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-6 text-white/40 hover:text-white/60 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Quick Filter Chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3 mt-8"
            >
              <span className="text-sm text-white/40">Quick filters:</span>
              <button
                onClick={() => setFilters(f => ({ ...f, popular: !f.popular }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filters.popular
                    ? 'bg-orange-500/20 border border-orange-500/40 text-orange-400'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Popular
              </button>
              <button
                onClick={() => setFilters(f => ({ ...f, vegetarian: !f.vegetarian }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filters.vegetarian
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                <Leaf className="w-4 h-4" />
                Vegetarian
              </button>
              <button
                onClick={() => setFilters(f => ({ ...f, spicy: !f.spicy }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filters.spicy
                    ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                <Flame className="w-4 h-4" />
                Spicy
              </button>
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-8 mt-8 text-sm text-white/50"
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-4 h-4 text-orange-400 fill-current" />
                  ))}
                </div>
                <span>500+ reviews</span>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Ready in 20-30 min</span>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Family-owned</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bento Box Category Cards - Visual Navigation */}
      {!searchQuery && activeCategory === 'all' && !isCateringOrder && (
        <div className="bg-black py-8 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Browse by Category</h2>
              <span className="text-sm text-white/40">{displayCategories.length} categories</span>
            </div>

            {/* Bento Box Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 auto-rows-[140px] md:auto-rows-[160px]">
              {displayCategories.slice(0, 6).map((category, index) => {
                const categoryProducts = menuItems.filter(item =>
                  item.categories?.some(cat => cat.id === category.id) &&
                  !item.categories?.some(cat => cat.slug?.includes('catering'))
                );
                const firstProductImage = categoryProducts[0]?.images?.[0]?.src;

                // Bento box sizing: first item spans 2x2, others vary
                const isLarge = index === 0;
                const isMedium = index === 1 || index === 2;

                const sizeClasses = isLarge
                  ? 'col-span-2 row-span-2'
                  : isMedium
                    ? 'col-span-1 row-span-2 md:col-span-2 md:row-span-1'
                    : 'col-span-1 row-span-1';

                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => scrollToCategory(category.id)}
                    className={`group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 transition-all ${sizeClasses}`}
                  >
                    {firstProductImage && (
                      <img
                        src={firstProductImage}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                      <span className={`font-bold text-white leading-tight mb-1 ${isLarge ? 'text-xl md:text-2xl' : 'text-sm md:text-base'}`}>
                        {category.name}
                      </span>
                      <span className={`text-white/60 ${isLarge ? 'text-sm' : 'text-xs'}`}>
                        {categoryItemCounts[category.id] || 0} items
                      </span>
                    </div>

                    {/* Featured badge for first category */}
                    {isLarge && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-lg flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Featured
                        </span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Popular Items Section */}
      {!searchQuery && activeCategory === 'all' && !isCateringOrder && (
        <div className="bg-gradient-to-b from-black to-zinc-950 py-10 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Most Popular</h2>
                <p className="text-sm text-white/40">Customer favorites</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {menuItems
                .filter(item => item.isPopular && !item.categories?.some(cat => cat.slug?.includes('catering')))
                .slice(0, 4)
                .map((item, index) => {
                  const quantity = getItemQuantity(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setQuickViewItem(item)}
                      className="group cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {item.images?.[0]?.src ? (
                          <img
                            src={item.images[0].src}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                            <span className="text-5xl">{getEmojiForProduct(item)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-orange-500/90 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Popular
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2">
                          {quantity === 0 ? (
                            <button
                              onClick={(e) => handleQuickAdd(item, e)}
                              className="w-10 h-10 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-xl rounded-full p-1">
                              <button
                                onClick={(e) => handleQuantityChange(item, quantity - 1, e)}
                                className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-full"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-6 text-center font-bold text-white text-sm">{quantity}</span>
                              <button
                                onClick={(e) => handleQuantityChange(item, quantity + 1, e)}
                                className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-full"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-white text-sm line-clamp-1">{item.name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-white">${parseFloat(item.price).toFixed(2)}</span>
                          {productHasModifiers(item) && (
                            <span className="text-xs text-orange-400">Customize</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Order Type Toggle - Glass Design */}
      <div className="sticky top-16 z-40 border-b border-white/5 bg-black/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex gap-1 bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl">
              <button
                onClick={() => setIsCateringOrder(false)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  !isCateringOrder
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <Store className="w-5 h-5" />
                <span>Pickup</span>
              </button>
              
              <button
                onClick={() => setIsCateringOrder(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  isCateringOrder
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <Truck className="w-5 h-5" />
                <span>Catering</span>
                <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                  $250 min
                </span>
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {isCateringOrder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
              >
                <p className="text-sm text-white/60 text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>Delivery within 25 miles • Order 4+ hours in advance</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Category Navigation - Glass Scrollbar */}
      <div className="sticky top-36 z-30 bg-black/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 py-4">
            {/* Mobile: Jump to Category Dropdown */}
            <div className="relative md:hidden" ref={categoryDropdownRef}>
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium"
              >
                <span className="max-w-[120px] truncate">
                  {activeCategory === 'all'
                    ? 'All Items'
                    : displayCategories.find(c => c.id === activeCategory)?.name || 'Category'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {categoryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="max-h-80 overflow-y-auto py-2">
                      <button
                        onClick={() => {
                          scrollToCategory('all');
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                          activeCategory === 'all' ? 'bg-orange-500/20 text-orange-400' : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <span className="font-medium">All Items</span>
                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">{categoryItemCounts.all || 0}</span>
                      </button>
                      {displayCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            scrollToCategory(category.id);
                            setCategoryDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                            activeCategory === category.id ? 'bg-orange-500/20 text-orange-400' : 'text-white/80 hover:bg-white/5'
                          }`}
                        >
                          <span className="font-medium">{category.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">{categoryItemCounts[category.id] || 0}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop: Filter Button */}
            <button
              onClick={() => setFilterOpen(true)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl border font-medium transition-all flex items-center gap-2 ${
                Object.values(filters).some(v => v)
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {Object.values(filters).filter(v => v).length > 0 && (
                <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  {Object.values(filters).filter(v => v).length}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl border font-medium transition-all flex items-center gap-2 ${
                  sortBy !== 'default'
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                <SortAsc className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {sortOptions.find(o => o.value === sortBy)?.label || 'Sort'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="py-2">
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setSortDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                              sortBy === option.value
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'text-white/80 hover:bg-white/5'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="font-medium">{option.label}</span>
                            {sortBy === option.value && (
                              <Check className="w-4 h-4 ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop: Category Tabs with Item Counts */}
            <div className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
              <button
                onClick={() => scrollToCategory('all')}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeCategory === 'all'
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                All
                <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">{categoryItemCounts.all || 0}</span>
              </button>

              {displayCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => scrollToCategory(category.id)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeCategory === category.id
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {category.name}
                  <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">{categoryItemCounts[category.id] || 0}</span>
                </button>
              ))}
            </div>

            {/* Results Count */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-white/40 ml-auto">
              <span>{filteredItems.length} items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Active Filters */}
        {Object.entries(filters).some(([_, v]) => v) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-8 flex-wrap"
          >
            <span className="text-sm text-white/50">Active:</span>
            {filters.vegetarian && (
              <span className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-medium flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Vegetarian
                <button onClick={() => setFilters(f => ({...f, vegetarian: false}))}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.spicy && (
              <span className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Spicy
                <button onClick={() => setFilters(f => ({...f, spicy: false}))}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.popular && (
              <span className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Popular
                <button onClick={() => setFilters(f => ({...f, popular: false}))}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
          </motion.div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
          >
            <p className="text-sm text-white/60">
              <span className="font-semibold text-white">{filteredItems.length}</span> results for "{searchQuery}"
            </p>
          </motion.div>
        )}

        {/* Product Grid */}
        {Object.keys(itemsByCategory).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-white/20" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No dishes found</h3>
            <p className="text-white/40 mb-8">Try adjusting your filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setFilters({ vegetarian: false, spicy: false, popular: false });
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {Object.entries(itemsByCategory).map(([categoryId, categoryData]) => {
              const items = Array.isArray(categoryData) ? categoryData : categoryData.items;
              const categoryName = Array.isArray(categoryData) 
                ? displayCategories.find(c => c.id === parseInt(categoryId))?.name || categoryId
                : categoryData.name;
              
              // Skip empty categories
              if (!items || items.length === 0) return null;
              
              return (
                <div 
                  key={categoryId} 
                  ref={el => categoryRefs.current[categoryId] = el}
                >
                  {activeCategory === 'all' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between mb-8"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-white">
                          {categoryName}
                        </h2>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/60 rounded-full text-sm font-semibold">
                          {items.length}
                        </span>
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/20" />
                    </motion.div>
                  )}
                  
                  {/* GLASS PRODUCT CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item, index) => {
                      const quantity = getItemQuantity(item.id);
                      
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => setQuickViewItem(item)}
                          className="group cursor-pointer"
                        >
                          {/* Glass Card */}
                          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10">
                            {/* Image */}
                            <div className="relative aspect-square overflow-hidden">
                              {item.images && item.images[0]?.src ? (
                                <img
                                  src={item.images[0].src}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                  <span className="text-6xl">{getEmojiForProduct(item)}</span>
                                </div>
                              )}
                              
                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                              
                              {/* Badges */}
                              <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {item.isPopular && (
                                  <span className="px-3 py-1.5 bg-orange-500/90 backdrop-blur-xl text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                                    <Star className="w-3 h-3 fill-current" />
                                    POPULAR
                                  </span>
                                )}
                                <div className="flex gap-1.5">
                                  {item.isVegetarian && (
                                    <span className="w-8 h-8 bg-green-500/90 backdrop-blur-xl text-white rounded-full flex items-center justify-center shadow-lg">
                                      <Leaf className="w-4 h-4" />
                                    </span>
                                  )}
                                  {item.isSpicy && (
                                    <span className="w-8 h-8 bg-red-500/90 backdrop-blur-xl text-white rounded-full flex items-center justify-center shadow-lg">
                                      <Flame className="w-4 h-4" />
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quick Add */}
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
                                      className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-2xl shadow-orange-500/50 flex items-center justify-center backdrop-blur-xl"
                                    >
                                      <Plus className="w-6 h-6" />
                                    </motion.button>
                                  ) : (
                                    <motion.div
                                      key="quantity"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      className="flex items-center gap-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-2xl p-1.5"
                                    >
                                      <button
                                        onClick={(e) => handleQuantityChange(item, quantity - 1, e)}
                                        className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                      <span className="w-8 text-center font-bold text-white">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={(e) => handleQuantityChange(item, quantity + 1, e)}
                                        className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                              <h3 className="font-bold text-white mb-2 line-clamp-1 text-lg">
                                {item.name}
                              </h3>
                              
                              {(item.short_description || item.description) && (
                                <p 
                                  className="text-sm text-white/40 line-clamp-2 mb-4 leading-relaxed"
                                  dangerouslySetInnerHTML={{ 
                                    __html: (item.short_description || item.description).replace(/<\/?p>/g, '') 
                                  }}
                                />
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  {isVariableProduct(item) ? (
                                    <>
                                      <span className="text-lg font-bold text-white">
                                        {item.price ? `From $${parseFloat(item.price).toFixed(2)}` : 'Select Option'}
                                      </span>
                                      <span className="text-xs text-orange-400 mt-1">
                                        Multiple sizes available
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-2xl font-bold text-white">
                                        ${parseFloat(item.price).toFixed(2)}
                                      </span>
                                      {item.prepTime && (
                                        <span className="text-xs text-white/30 flex items-center gap-1 mt-1">
                                          <Clock className="w-3 h-3" />
                                          {item.prepTime} min
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>

                                {isVariableProduct(item) ? (
                                  <span className="text-xs text-orange-400 font-medium">
                                    Select Size →
                                  </span>
                                ) : productHasModifiers(item) && (
                                  <span className="text-xs text-orange-400 font-medium">
                                    Customize →
                                  </span>
                                )}
                              </div>
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

      {/* Filter Modal - Glass Design */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 sticky top-0 bg-zinc-950/95 backdrop-blur-2xl z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Filters</h3>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-white/60" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-white mb-4 text-lg">Dietary</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl cursor-pointer hover:border-white/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Vegetarian</p>
                          <p className="text-sm text-white/40">Plant-based dishes</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={filters.vegetarian}
                        onChange={(e) => setFilters(f => ({...f, vegetarian: e.target.checked}))}
                        className="w-6 h-6 rounded-lg bg-white/5 border-white/20 text-green-500 focus:ring-green-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl cursor-pointer hover:border-white/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                          <Flame className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Spicy</p>
                          <p className="text-sm text-white/40">Extra heat</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={filters.spicy}
                        onChange={(e) => setFilters(f => ({...f, spicy: e.target.checked}))}
                        className="w-6 h-6 rounded-lg bg-white/5 border-white/20 text-red-500 focus:ring-red-500"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-4 text-lg">Sort</h4>
                  <label className="flex items-center justify-between p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl cursor-pointer hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Popular Only</p>
                        <p className="text-sm text-white/40">Customer favorites</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={filters.popular}
                      onChange={(e) => setFilters(f => ({...f, popular: e.target.checked}))}
                      className="w-6 h-6 rounded-lg bg-white/5 border-white/20 text-orange-500 focus:ring-orange-500"
                    />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-white/10 sticky bottom-0 bg-zinc-950/95 backdrop-blur-2xl">
                <div className="flex gap-3">
                  <button
                    onClick={() => setFilters({ vegetarian: false, spicy: false, popular: false })}
                    className="flex-1 py-4 border border-white/20 text-white rounded-2xl font-semibold hover:bg-white/5 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                  >
                    Show {filteredItems.length}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick View Modal - FIXED VERSION */}
      <AnimatePresence>
        {quickViewItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewItem(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            />
            
            {/* FIXED: Centering container - NO animation on this layer */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              {/* Animated modal content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-2xl pointer-events-auto"
              >
                <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10" style={{ maxHeight: '85vh' }}>
                  
                  {/* Image */}
                  <div className="relative w-full flex-shrink-0" style={{ height: '280px' }}>
                    {quickViewItem.images && quickViewItem.images[0]?.src ? (
                      <img
                        src={quickViewItem.images[0].src}
                        alt={quickViewItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                        <span className="text-7xl">{getEmojiForProduct(quickViewItem)}</span>
                      </div>
                    )}
                    
                    {/* Close Button */}
                    <button
                      onClick={() => setQuickViewItem(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  </div>

                  {/* Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Title & Price */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                        {quickViewItem.name}
                      </h2>
                      <span className="text-xl md:text-2xl font-bold text-orange-400 whitespace-nowrap">
                        {isVariableProduct(quickViewItem)
                          ? (quickViewItem.price ? `From $${parseFloat(quickViewItem.price).toFixed(2)}` : 'Select Option')
                          : `$${parseFloat(quickViewItem.price).toFixed(2)}`
                        }
                      </span>
                    </div>

                    {/* Description */}
                    {(quickViewItem.short_description || quickViewItem.description) && (
                      <div 
                        className="text-white/60 leading-relaxed text-sm md:text-base"
                        dangerouslySetInnerHTML={{ 
                          __html: quickViewItem.description || quickViewItem.short_description
                        }}
                      />
                    )}
                  </div>

                  {/* Actions - Fixed at bottom */}
                  <div className="p-6 border-t border-white/10 bg-zinc-950/95 backdrop-blur-2xl flex-shrink-0">
                    <button
                      onClick={(e) => {
                        const item = quickViewItem;
                        // Handle WooCommerce variable products
                        if (isVariableProduct(item)) {
                          setVariationProduct(item);
                          setQuickViewItem(null);
                          setTimeout(() => {
                            setVariationModalOpen(true);
                          }, 50);
                        }
                        // Handle config-based modifiers
                        else if (productHasModifiers(item)) {
                          setModifierProduct(item);
                          setQuickViewItem(null);
                          setTimeout(() => {
                            setModifierModalOpen(true);
                          }, 50);
                        } else {
                          handleQuickAdd(item, e);
                          setQuickViewItem(null);
                        }
                      }}
                      className="w-full py-4 md:py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/50 transition-all active:scale-[0.98]"
                    >
                      <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                      {isVariableProduct(quickViewItem)
                        ? 'Select Option & Add'
                        : productHasModifiers(quickViewItem)
                          ? 'Customize & Add'
                          : `Add • $${parseFloat(quickViewItem.price).toFixed(2)}`
                      }
                    </button>
                  </div>
                  
                </div>
              </motion.div>
            </div>
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

      {/* Variation Modal for Variable Products */}
      <VariationModal
        product={variationProduct}
        isOpen={variationModalOpen}
        onClose={() => {
          setVariationModalOpen(false);
          setVariationProduct(null);
        }}
        onAddToCart={handleAddWithVariation}
      />

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-2xl shadow-orange-500/30 flex items-center justify-center hover:shadow-orange-500/50 transition-all hover:scale-110 active:scale-95"
            aria-label="Back to top"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcut Hint - shows briefly on first load */}
      <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
        <div className="text-xs text-white/30">
          Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">Esc</kbd> to close modals
        </div>
      </div>
    </div>
  );
}