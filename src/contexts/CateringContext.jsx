// src/contexts/CateringContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const CateringContext = createContext();

export function CateringProvider({ children }) {
  const [isCateringOrder, setIsCateringOrder] = useState(false);
  const [cateringDetails, setCateringDetails] = useState({
    deliveryDate: '',
    deliveryTime: '',
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      instructions: ''
    },
    needSetup: false,
    needUtensils: false,
    numberOfGuests: '',
    specialInstructions: ''
  });

  // Calculate minimum delivery time (4 hours from now)
  const getMinimumDeliveryTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 4);
    return now.toISOString().slice(0, 16);
  };

  // Validate address is within 25 miles (you'll need to implement actual distance calculation)
  const validateDeliveryAddress = async (address) => {
    // For now, just validate that all required fields are filled
    // You can integrate with Google Maps API for actual distance calculation
    const requiredFields = ['street', 'city', 'state', 'zipCode'];
    return requiredFields.every(field => address[field] && address[field].trim() !== '');
  };

  const validateCateringOrder = (cartTotal) => {
    const errors = [];

    // Check minimum order amount ($250)
    if (cartTotal < 250) {
      errors.push(`Catering orders require a minimum of $250 (current: $${cartTotal.toFixed(2)})`);
    }

    // Check delivery time (4 hours advance)
    if (cateringDetails.deliveryDate && cateringDetails.deliveryTime) {
      const deliveryDateTime = new Date(`${cateringDetails.deliveryDate}T${cateringDetails.deliveryTime}`);
      const minTime = new Date(getMinimumDeliveryTime());
      if (deliveryDateTime < minTime) {
        errors.push('Catering orders must be placed at least 4 hours in advance');
      }
    } else {
      errors.push('Please select delivery date and time');
    }

    // Check address
    if (!cateringDetails.deliveryAddress.street || !cateringDetails.deliveryAddress.city || 
        !cateringDetails.deliveryAddress.state || !cateringDetails.deliveryAddress.zipCode) {
      errors.push('Please provide complete delivery address');
    }

    return errors;
  };

  const resetCateringDetails = () => {
    setIsCateringOrder(false);
    setCateringDetails({
      deliveryDate: '',
      deliveryTime: '',
      deliveryAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        instructions: ''
      },
      needSetup: false,
      needUtensils: false,
      numberOfGuests: '',
      specialInstructions: ''
    });
  };

  return (
    <CateringContext.Provider value={{
      isCateringOrder,
      setIsCateringOrder,
      cateringDetails,
      setCateringDetails,
      getMinimumDeliveryTime,
      validateDeliveryAddress,
      validateCateringOrder,
      resetCateringDetails
    }}>
      {children}
    </CateringContext.Provider>
  );
}

export const useCatering = () => {
  const context = useContext(CateringContext);
  if (!context) {
    throw new Error('useCatering must be used within a CateringProvider');
  }
  return context;
};