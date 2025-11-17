import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ChefHat, Flame, Leaf, Star, ChevronDown } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, index }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});

  // Check if product has variations
  const hasVariations = product.type === 'variable' && product.variations && product.variations.length > 0;
  
  // Get available attributes for variable products
  const availableAttributes = product.attributes || [];

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleAttributeChange = (attributeName, value) => {
    const newAttributes = {
      ...selectedAttributes,
      [attributeName]: value
    };
    setSelectedAttributes(newAttributes);
    
    // Find matching variation based on selected attributes
    if (hasVariations) {
      const variation = product.variations.find(v => 
        Object.entries(newAttributes).every(([key, val]) => 
          v.attributes.find(attr => attr.name === key && attr.option === val)
        )
      );
      setSelectedVariation(variation);
    }
  };

  const handleAddToCart = () => {
    const productToAdd = {
      id: selectedVariation ? selectedVariation.id : product.id,
      name: product.name,
      price: selectedVariation ? selectedVariation.price : product.price,
      image: product.images?.[0]?.src,
      // Include variation data for variable products
      ...(selectedVariation && {
        variation_id: selectedVariation.id,
        attributes: selectedAttributes
      })
    };
    
    onAddToCart(productToAdd, quantity);
    toast.success(
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4" />
        <span>{quantity}x {product.name} added to cart</span>
      </div>
    );
    setQuantity(1);
    setSelectedAttributes({});
    setSelectedVariation(null);
  };

  const isVegetarian = product.tags?.some(tag => tag.slug === 'vegetarian');
  const isSpicy = product.tags?.some(tag => tag.slug === 'spicy');
  const isChefSpecial = product.tags?.some(tag => tag.slug === 'chef-special');

  const currentPrice = selectedVariation ? selectedVariation.price : product.price;
  const isAddToCartDisabled = hasVariations && !selectedVariation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
    >
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.images?.[0]?.src || '/api/placeholder/400/300'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {isVegetarian && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              Veg
            </span>
          )}
          {isSpicy && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Spicy
            </span>
          )}
          {isChefSpecial && (
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <ChefHat className="w-3 h-3" />
              Special
            </span>
          )}
          {hasVariations && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Options
            </span>
          )}
        </div>

        {/* Rating */}
        {product.average_rating > 0 && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium">{product.average_rating}</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-masala-900 text-lg line-clamp-1 flex-1">
            {product.name}
          </h3>
          <span className="text-primary-600 font-bold text-lg ml-2">
            ${parseFloat(currentPrice).toFixed(2)}
          </span>
        </div>

        <p className="text-masala-600 text-sm mb-4 line-clamp-2">
          {product.short_description ? 
            product.short_description.replace(/<[^>]*>/g, '') : 
            'Delicious authentic dish'
          }
        </p>

        {/* Product Attributes for Variable Products */}
        {hasVariations && availableAttributes.map(attribute => (
          <div key={attribute.name} className="mb-3">
            <label className="block text-sm font-medium text-masala-700 mb-1">
              {attribute.name}:
            </label>
            <select
              value={selectedAttributes[attribute.name] || ''}
              onChange={(e) => handleAttributeChange(attribute.name, e.target.value)}
              className="w-full p-2 border border-masala-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose {attribute.name}</option>
              {attribute.options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Variation Price Display */}
        {selectedVariation && selectedVariation.price !== product.price && (
          <div className="mb-3 p-2 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-700">
              Selected: ${parseFloat(selectedVariation.price).toFixed(2)}
            </p>
          </div>
        )}

        {/* Quantity Selector and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={decrement}
              className="w-8 h-8 rounded-full bg-masala-100 text-masala-600 flex items-center justify-center hover:bg-masala-200 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={increment}
              className="w-8 h-8 rounded-full bg-masala-100 text-masala-600 flex items-center justify-center hover:bg-masala-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <motion.button
            whileHover={{ scale: isAddToCartDisabled ? 1 : 1.02 }}
            whileTap={{ scale: isAddToCartDisabled ? 1 : 0.98 }}
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
              isAddToCartDisabled
                ? 'bg-masala-300 text-masala-500 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            {isAddToCartDisabled ? 'Select Options' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}