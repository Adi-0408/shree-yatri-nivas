import { StorageService } from './storageService';

export const PricingService = {
  // GET /api/admin/pricing
  async fetchPricingConfig() {
    try {
      const res = await fetch('/api/admin/pricing', { cache: 'no-store' });
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
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ ...newConfig, adminUser })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save pricing configuration');
      }
      StorageService.updatePricingConfig(data.pricing, adminUser);
      return data;
    } catch (err) {
      if (err.message && err.message.includes('Price must be')) {
        throw err;
      }
      // fallback to client-side localStorage
      return StorageService.updatePricingConfig(newConfig, adminUser);
    }
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
  },

  async saveDateRangeRate(rateData, adminUser = "Admin") {
    return StorageService.saveDateRangeRate(rateData, adminUser);
  },

  async deleteDateRangeRate(id, adminUser = "Admin") {
    return StorageService.deleteDateRangeRate(id, adminUser);
  }
};
