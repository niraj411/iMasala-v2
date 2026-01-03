import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  CATERING_MINIMUM_ORDER,
  DELIVERY_FEES,
  getDeliveryFee,
  getDeliveryZoneInfo
} from '../config/delivery';

const CateringContext = createContext();

// Catering pricing constants
export const CATERING_PRICING = {
  UTENSIL_PRICE: 0.49,                    // Per guest
  DELIVERY_FEE_ZONE_1: DELIVERY_FEES.ZONE_1,  // Local area
  DELIVERY_FEE_ZONE_2: DELIVERY_FEES.ZONE_2,  // Extended area
  MINIMUM_ORDER: CATERING_MINIMUM_ORDER       // From delivery config
};

export function CateringProvider({ children }) {
  const [isCateringOrder, setIsCateringOrder] = useState(false);
  const [cateringDetails, setCateringDetails] = useState({
    deliveryMethod: 'pickup', // 'pickup' or 'delivery'
    deliveryDate: '',
    deliveryTime: '',
    numberOfGuests: 0,
    needSetup: false,
    needUtensils: false,
    specialInstructions: '',
    deliveryAddress: null
  });

  const updateCateringDetails = (details) => {
    setCateringDetails(prev => ({
      ...prev,
      ...details
    }));
  };

  const validateCateringOrder = (cartTotal) => {
    const errors = [];

    // Check minimum order amount
    if (cartTotal < 250) {
      errors.push('Catering orders require a minimum of $250');
    }

    // Check required fields
    if (!cateringDetails.deliveryDate) {
      errors.push('Please select a delivery/pickup date');
    }

    if (!cateringDetails.deliveryTime) {
      errors.push('Please select a delivery/pickup time');
    }

    if (!cateringDetails.numberOfGuests || cateringDetails.numberOfGuests < 1) {
      errors.push('Please specify the number of guests');
    }

    // Check delivery address if delivery method is selected
    if (cateringDetails.deliveryMethod === 'delivery') {
      if (!cateringDetails.deliveryAddress?.address) {
        errors.push('Please enter a delivery address');
      }
      if (!cateringDetails.deliveryAddress?.city) {
        errors.push('Please enter delivery city');
      }
      if (!cateringDetails.deliveryAddress?.zipCode) {
        errors.push('Please enter delivery ZIP code');
      }
    }

    // Check advance notice (4 hours minimum)
    if (cateringDetails.deliveryDate && cateringDetails.deliveryTime) {
      const deliveryDateTime = new Date(`${cateringDetails.deliveryDate}T${cateringDetails.deliveryTime}`);
      const now = new Date();
      const hoursDifference = (deliveryDateTime - now) / (1000 * 60 * 60);

      if (hoursDifference < 4) {
        errors.push('Catering orders require at least 4 hours advance notice');
      }
    }

    return errors;
  };

  const resetCateringDetails = () => {
    setCateringDetails({
      deliveryMethod: 'pickup',
      deliveryDate: '',
      deliveryTime: '',
      numberOfGuests: 0,
      needSetup: false,
      needUtensils: false,
      specialInstructions: '',
      deliveryAddress: null
    });
    setIsCateringOrder(false);
  };

  // Computed catering fees with zone-based delivery pricing
  const cateringFees = useMemo(() => {
    const utensilsCost = cateringDetails.needUtensils && cateringDetails.numberOfGuests > 0
      ? cateringDetails.numberOfGuests * CATERING_PRICING.UTENSIL_PRICE
      : 0;

    // Get zone-based delivery fee from zip code
    let deliveryFee = 0;
    let deliveryZoneInfo = null;

    if (cateringDetails.deliveryMethod === 'delivery' && cateringDetails.deliveryAddress?.zipCode) {
      deliveryFee = getDeliveryFee(cateringDetails.deliveryAddress.zipCode);
      deliveryZoneInfo = getDeliveryZoneInfo(cateringDetails.deliveryAddress.zipCode);
    }

    return {
      utensilsCost,
      deliveryFee,
      deliveryZoneInfo,
      totalFees: utensilsCost + deliveryFee
    };
  }, [
    cateringDetails.needUtensils,
    cateringDetails.numberOfGuests,
    cateringDetails.deliveryMethod,
    cateringDetails.deliveryAddress?.zipCode
  ]);

  const value = {
    isCateringOrder,
    setIsCateringOrder,
    cateringDetails,
    updateCateringDetails,
    validateCateringOrder,
    resetCateringDetails,
    cateringFees,
    CATERING_PRICING
  };

  return (
    <CateringContext.Provider value={value}>
      {children}
    </CateringContext.Provider>
  );
}

export function useCatering() {
  const context = useContext(CateringContext);
  if (!context) {
    throw new Error('useCatering must be used within a CateringProvider');
  }
  return context;
}