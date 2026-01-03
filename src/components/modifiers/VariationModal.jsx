// src/components/modifiers/VariationModal.jsx - WooCommerce Variable Product Modal
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Check, ShoppingBag, Loader2 } from 'lucide-react';
import { woocommerceService } from '../../services/woocommerceService';
import { getEmojiForProduct } from '../../config/categoryImages';

export default function VariationModal({
  product,
  isOpen,
  onClose,
  onAddToCart
}) {
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableAttributes, setAvailableAttributes] = useState([]);

  // Fetch variations when modal opens
  useEffect(() => {
    if (isOpen && product && product.type === 'variable') {
      // Check if variations are already attached to product
      if (product.variations && Array.isArray(product.variations) && product.variations.length > 0 && typeof product.variations[0] === 'object') {
        setVariations(product.variations);
        extractAttributesFromVariations(product.variations);
      } else {
        // Fetch variations from API
        fetchVariations();
      }
    }
  }, [isOpen, product]);

  const fetchVariations = async () => {
    if (!product?.id) return;

    setLoading(true);
    try {
      const fetchedVariations = await woocommerceService.getProductVariations(product.id);
      setVariations(fetchedVariations);
      extractAttributesFromVariations(fetchedVariations);
    } catch (error) {
      console.error('Error fetching variations:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractAttributesFromVariations = (variationsList) => {
    // Extract unique attributes from variations
    const attrMap = new Map();

    variationsList.forEach(variation => {
      (variation.attributes || []).forEach(attr => {
        const name = attr.name || '';
        const option = attr.option || '';
        if (name && option) {
          if (!attrMap.has(name)) {
            attrMap.set(name, new Set());
          }
          attrMap.get(name).add(option);
        }
      });
    });

    const attrs = Array.from(attrMap.entries()).map(([name, options]) => ({
      name,
      options: Array.from(options)
    }));

    setAvailableAttributes(attrs);

    // Auto-select first option if only one attribute
    if (attrs.length === 1 && attrs[0].options.length > 0) {
      const firstOption = attrs[0].options[0];
      handleAttributeChange(attrs[0].name, firstOption, variationsList);
    }
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedVariation(null);
      setSelectedAttributes({});
      setQuantity(1);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!product) return null;

  const handleAttributeChange = (attributeName, value, variationsList = variations) => {
    const newAttributes = {
      ...selectedAttributes,
      [attributeName]: value
    };
    setSelectedAttributes(newAttributes);

    // Find matching variation
    const variation = variationsList.find(v => {
      return Object.entries(newAttributes).every(([key, val]) => {
        const keyLower = key.toLowerCase();
        const valLower = val.toLowerCase();
        return v.attributes.some(attr => {
          const attrName = (attr.name || '').toLowerCase();
          const attrOption = (attr.option || '').toLowerCase();
          return (attrName === keyLower || attrName === `pa_${keyLower}`) &&
                 attrOption === valLower;
        });
      });
    });

    setSelectedVariation(variation);
  };

  const currentPrice = selectedVariation
    ? parseFloat(selectedVariation.price)
    : (product.price ? parseFloat(product.price) : 0);

  const itemTotal = currentPrice * quantity;

  const handleAddToCart = () => {
    if (!selectedVariation) return;

    onAddToCart({
      id: product.id,
      variation_id: selectedVariation.id,
      name: product.name,
      variationName: Object.values(selectedAttributes).join(' - '),
      price: parseFloat(selectedVariation.price),
      image: selectedVariation.image?.src || product.images?.[0]?.src,
      quantity: quantity,
      attributes: selectedAttributes
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-end md:items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-full md:max-w-lg pointer-events-auto"
            >
              <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col border border-white/10 md:mx-4">

                {/* Drag Handle (Mobile) */}
                <div className="md:hidden flex justify-center pt-3 pb-1">
                  <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="flex items-start gap-4 p-5 md:p-6 border-b border-white/10 flex-shrink-0">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                    {product.images && product.images[0]?.src ? (
                      <img
                        src={product.images[0].src}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-2xl"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl items-center justify-center absolute inset-0"
                      style={{ display: product.images?.[0]?.src ? 'none' : 'flex' }}
                    >
                      <span className="text-4xl">{getEmojiForProduct(product)}</span>
                    </div>
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"></div>
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h2 className="text-lg md:text-xl font-bold text-white line-clamp-2 leading-tight">
                      {product.name}
                    </h2>
                    {selectedVariation ? (
                      <p className="text-orange-400 font-bold text-xl mt-2">
                        ${parseFloat(selectedVariation.price).toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-white/50 text-sm mt-2">
                        Select an option below
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-5 md:right-5 w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                    </div>
                  ) : (
                    availableAttributes.map((attribute) => (
                      <div key={attribute.name}>
                        {/* Attribute Header */}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-white text-base">
                            {attribute.name}
                            <span className="text-orange-400 ml-1">*</span>
                          </h3>
                          <span className="text-xs text-white/40 bg-white/5 px-2.5 py-1 rounded-full">
                            Required
                          </span>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                          {attribute.options.map((option) => {
                            const isSelected = selectedAttributes[attribute.name] === option;

                            // Find variation for this option to show price
                            const variationForOption = variations.find(v =>
                              v.attributes.some(attr => {
                                const attrName = (attr.name || '').toLowerCase();
                                const attrOption = (attr.option || '').toLowerCase();
                                return (attrName === attribute.name.toLowerCase() ||
                                        attrName === `pa_${attribute.name.toLowerCase()}`) &&
                                       attrOption === option.toLowerCase();
                              })
                            );
                            const optionPrice = variationForOption ? parseFloat(variationForOption.price) : null;

                            return (
                              <button
                                key={option}
                                onClick={() => handleAttributeChange(attribute.name, option)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-500/10'
                                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {/* Custom Radio */}
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                    isSelected
                                      ? 'border-orange-500 bg-orange-500 shadow-lg shadow-orange-500/30'
                                      : 'border-white/30 bg-transparent'
                                  }`}>
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                    )}
                                  </div>
                                  <span className={`text-left transition-colors ${
                                    isSelected ? 'text-white font-medium' : 'text-white/80'
                                  }`}>
                                    {option}
                                  </span>
                                </div>
                                {optionPrice !== null && (
                                  <span className={`text-sm font-bold ml-2 flex-shrink-0 ${
                                    isSelected ? 'text-orange-400' : 'text-white/60'
                                  }`}>
                                    ${optionPrice.toFixed(2)}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 p-5 md:p-6 space-y-4 flex-shrink-0 bg-zinc-950/95 backdrop-blur-2xl">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">Quantity</span>
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors active:scale-95 text-white/70 hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-white text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => q + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors active:scale-95 text-white/70 hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariation}
                    className={`w-full py-4 md:py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                      selectedVariation
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] text-white shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {selectedVariation
                      ? `Add to Order • $${itemTotal.toFixed(2)}`
                      : 'Select an Option'
                    }
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
