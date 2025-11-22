import React, { createContext, useContext, useState } from 'react';

const CateringContext = createContext();

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

  const value = {
    isCateringOrder,
    setIsCateringOrder,
    cateringDetails,
    updateCateringDetails,
    validateCateringOrder,
    resetCateringDetails
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