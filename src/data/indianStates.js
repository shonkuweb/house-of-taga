// Standard list of 28 Indian States & 8 Union Territories
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

// Helper to validate deliverability of a product to a location
export const checkProductDeliverability = (product, { state = '', pincode = '' } = {}) => {
  if (!product) return { isDeliverable: true };

  const scope = product.shippingScope || 'all_india';
  if (scope === 'all_india') {
    return { isDeliverable: true, message: 'All India delivery available' };
  }

  // 1. Specific States Only
  if (scope === 'specific_states') {
    const allowed = Array.isArray(product.allowedStates) ? product.allowedStates : [];
    if (allowed.length === 0) return { isDeliverable: true };

    if (!state.trim()) {
      return { 
        isDeliverable: true, 
        requiresState: true,
        message: `Restricted to: ${allowed.slice(0, 3).join(', ')}${allowed.length > 3 ? ` +${allowed.length - 3} more` : ''}` 
      };
    }

    const stateMatch = allowed.some(s => 
      s.toLowerCase().trim() === state.toLowerCase().trim() ||
      state.toLowerCase().trim().includes(s.toLowerCase().trim()) ||
      s.toLowerCase().trim().includes(state.toLowerCase().trim())
    );

    if (stateMatch) {
      return { isDeliverable: true, message: `Delivers to ${state}` };
    } else {
      return { 
        isDeliverable: false, 
        message: `Delivery not available in ${state}. Restricted to: ${allowed.join(', ')}` 
      };
    }
  }

  // 2. Specific Pincodes Only
  if (scope === 'specific_pincodes') {
    let allowed = [];
    if (Array.isArray(product.allowedPincodes)) {
      allowed = product.allowedPincodes.map(p => String(p).trim());
    } else if (typeof product.allowedPincodes === 'string') {
      allowed = product.allowedPincodes.split(/[\s,]+/).map(p => p.trim()).filter(Boolean);
    }

    if (allowed.length === 0) return { isDeliverable: true };

    const cleanPin = String(pincode || '').trim();
    if (!cleanPin) {
      return { 
        isDeliverable: true, 
        requiresPincode: true,
        message: `Specific pincodes only (${allowed.length} serviceable areas)` 
      };
    }

    if (cleanPin.length === 6 && /^\d{6}$/.test(cleanPin)) {
      const match = allowed.includes(cleanPin);
      if (match) {
        return { isDeliverable: true, message: `Serviceable at pincode ${cleanPin} (3-5 days delivery)` };
      } else {
        return { 
          isDeliverable: false, 
          message: `Delivery not available at pincode ${cleanPin}. Only specific pincodes are serviced.` 
        };
      }
    }
  }

  return { isDeliverable: true };
};
