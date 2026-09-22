import { StorageService } from './storageService';

export const PricingService = {
  // GET /api/admin/pricing
  async fetchPricingConfig() {
    try {
      const res = await fetch('/api/admin/pricing');
      if (res.ok) {
        const data = await res.json();
        if (data.pricing) return data.pricing;
      }
    } catch {
      // fallback to client-side localStorage
    }
    return StorageService.getPricingConfig();
  },

  // PUT /api/admin/pricing
  async savePricingConfig(newConfig, adminUser = "Admin") {
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newConfig, adminUser })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.pricing) {
          StorageService.updatePricingConfig(data.pricing, adminUser);
          return data;
        }
      }
    } catch {
      // fallback to client-side localStorage
    }
    return StorageService.updatePricingConfig(newConfig, adminUser);
  },

  // POST /api/bookings/calculate
  async calculateBookingPrice(params) {
    try {
      const res = await fetch('/api/bookings/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.calculation) return data.calculation;
      }
    } catch {
      // fallback to client-side calculation
    }
    return StorageService.calculateBookingCost(params);
  }
};
