import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In-memory Server Pricing State for Vite Server API
let serverPricingState = {
  base_rates: {
    AC: 2400,
    "Non-AC": 1400
  },
  extra_person_rate: 700,
  child_age_free_limit: 4,
  base_capacity_per_room: 2,
  max_capacity_per_room: 4,
  inventory: {
    AC: { total_rooms: 3, active: true },
    "Non-AC": { total_rooms: 2, active: true }
  },
  last_modified_by: "Admin",
  last_modified_at: new Date().toISOString(),
  audit_logs: [
    {
      id: "LOG-SERVER-INIT",
      timestamp: new Date().toISOString(),
      modified_by: "Admin",
      action: "API Initialized: 3 AC (₹2400), 2 Non-AC (₹1400), Extra Person ₹700, Child Free ≤ 4 yrs"
    }
  ]
};

function pricingApiPlugin() {
  return {
    name: 'pricing-api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // Helper to send JSON response
        const sendJson = (status, data) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          res.statusCode = status;
          res.end(JSON.stringify(data));
        };

        // Helper to parse JSON body
        const parseBody = (callback) => {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              callback(body ? JSON.parse(body) : {});
            } catch {
              sendJson(400, { success: false, error: 'Invalid JSON request payload' });
            }
          });
        };

        // GET /api/admin/pricing
        if (req.method === 'GET' && url === '/api/admin/pricing') {
          return sendJson(200, { success: true, pricing: serverPricingState });
        }

        // PUT /api/admin/pricing
        if (req.method === 'PUT' && url === '/api/admin/pricing') {
          return parseBody(body => {
            const acRate = body.base_rates?.AC !== undefined ? Number(body.base_rates.AC) : serverPricingState.base_rates.AC;
            const nonAcRate = body.base_rates?.["Non-AC"] !== undefined ? Number(body.base_rates["Non-AC"]) : serverPricingState.base_rates["Non-AC"];
            const extraRate = body.extra_person_rate !== undefined ? Number(body.extra_person_rate) : serverPricingState.extra_person_rate;
            const childLimit = body.child_age_free_limit !== undefined ? Number(body.child_age_free_limit) : serverPricingState.child_age_free_limit;
            const acQty = body.inventory?.AC?.total_rooms !== undefined ? Number(body.inventory.AC.total_rooms) : serverPricingState.inventory.AC.total_rooms;
            const nonAcQty = body.inventory?.["Non-AC"]?.total_rooms !== undefined ? Number(body.inventory["Non-AC"].total_rooms) : serverPricingState.inventory["Non-AC"].total_rooms;
            const adminUser = body.adminUser || body.modified_by || 'Admin';

            if (isNaN(acRate) || acRate < 0 || isNaN(nonAcRate) || nonAcRate < 0) {
              return sendJson(400, { success: false, error: 'Price must be greater than or equal to 0.' });
            }
            if (isNaN(extraRate) || extraRate < 0) {
              return sendJson(400, { success: false, error: 'Price must be greater than or equal to 0.' });
            }
            if (isNaN(childLimit) || childLimit < 0) {
              return sendJson(400, { success: false, error: 'Child age free limit must be greater than or equal to 0.' });
            }
            if (isNaN(acQty) || acQty < 0 || isNaN(nonAcQty) || nonAcQty < 0) {
              return sendJson(400, { success: false, error: 'Room inventory count must be greater than or equal to 0.' });
            }

            const changeDescriptions = [];
            if (serverPricingState.base_rates.AC !== acRate) changeDescriptions.push(`AC Rate: ₹${serverPricingState.base_rates.AC} → ₹${acRate}`);
            if (serverPricingState.base_rates["Non-AC"] !== nonAcRate) changeDescriptions.push(`Non-AC Rate: ₹${serverPricingState.base_rates["Non-AC"]} → ₹${nonAcRate}`);
            if (serverPricingState.extra_person_rate !== extraRate) changeDescriptions.push(`Extra Person: ₹${serverPricingState.extra_person_rate} → ₹${extraRate}`);
            if (serverPricingState.child_age_free_limit !== childLimit) changeDescriptions.push(`Child Free Age: ${serverPricingState.child_age_free_limit}y → ${childLimit}y`);
            if (serverPricingState.inventory.AC.total_rooms !== acQty) changeDescriptions.push(`AC Rooms: ${serverPricingState.inventory.AC.total_rooms} → ${acQty}`);
            if (serverPricingState.inventory["Non-AC"].total_rooms !== nonAcQty) changeDescriptions.push(`Non-AC Rooms: ${serverPricingState.inventory["Non-AC"].total_rooms} → ${nonAcQty}`);

            const newLog = {
              id: `LOG-${Date.now()}`,
              timestamp: new Date().toISOString(),
              modified_by: adminUser,
              action: changeDescriptions.length > 0 ? changeDescriptions.join(', ') : 'Updated settings'
            };

            serverPricingState = {
              ...serverPricingState,
              base_rates: {
                AC: acRate,
                "Non-AC": nonAcRate
              },
              extra_person_rate: extraRate,
              child_age_free_limit: childLimit,
              inventory: {
                AC: {
                  total_rooms: acQty,
                  active: body.inventory?.AC?.active !== false
                },
                "Non-AC": {
                  total_rooms: nonAcQty,
                  active: body.inventory?.["Non-AC"]?.active !== false
                }
              },
              last_modified_by: adminUser,
              last_modified_at: new Date().toISOString(),
              audit_logs: [newLog, ...serverPricingState.audit_logs].slice(0, 50)
            };

            return sendJson(200, { success: true, pricing: serverPricingState });
          });
        }

        // POST /api/bookings/calculate
        if (req.method === 'POST' && url === '/api/bookings/calculate') {
          return parseBody(body => {
            const {
              acStatus = 'AC',
              checkIn,
              checkOut,
              roomQty = 1,
              adults = 2,
              childrenUnder4 = 0,
              childrenAbove4 = 0,
              childrenAges
            } = body;

            const parsedQty = Math.max(1, parseInt(roomQty, 10) || 1);
            const parsedAdults = Math.max(1, parseInt(adults, 10) || 1);
            const childLimit = typeof serverPricingState.child_age_free_limit === 'number' ? serverPricingState.child_age_free_limit : 4;

            let parsedKidsUnder4 = Math.max(0, parseInt(childrenUnder4, 10) || 0);
            let parsedKidsAbove4 = Math.max(0, parseInt(childrenAbove4, 10) || 0);

            if (Array.isArray(childrenAges)) {
              parsedKidsUnder4 = childrenAges.filter(a => Number(a) <= childLimit).length;
              parsedKidsAbove4 = childrenAges.filter(a => Number(a) > childLimit).length;
            }

            let nights = 1;
            if (checkIn && checkOut) {
              const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
              const calcDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
              nights = calcDays > 0 ? calcDays : 1;
            }

            const baseRate = Math.round(serverPricingState.base_rates[acStatus] || (acStatus === 'Non-AC' ? 1400 : 2400));
            const baseCapacityPerRoom = serverPricingState.base_capacity_per_room || 2;
            const maxCapacityPerRoom = serverPricingState.max_capacity_per_room || 4;
            const maxAllowedGuests = maxCapacityPerRoom * parsedQty;

            const totalGuests = parsedAdults + parsedKidsUnder4 + parsedKidsAbove4;
            const exceedsMaxCapacity = totalGuests > maxAllowedGuests;

            const chargeableGuests = parsedAdults + parsedKidsAbove4;
            const includedGuests = baseCapacityPerRoom * parsedQty;
            const extraGuests = Math.max(0, chargeableGuests - includedGuests);

            const extraPersonRate = Math.round(serverPricingState.extra_person_rate ?? 700);
            const roomBaseCharge = Math.round(baseRate * parsedQty * nights);
            const extraGuestCharge = Math.round(extraGuests * extraPersonRate * nights);
            const totalAmount = Math.round(roomBaseCharge + extraGuestCharge);

            return sendJson(200, {
              success: true,
              calculation: {
                numberOfNights: nights,
                roomQty: parsedQty,
                baseRate,
                roomBaseCharge,
                adults: parsedAdults,
                childrenUnder4: parsedKidsUnder4,
                childrenAbove4: parsedKidsAbove4,
                childrenAges: Array.isArray(childrenAges) ? childrenAges : [],
                totalGuests,
                includedGuests,
                chargeableGuests,
                extraGuests,
                extraPersonRate,
                extraGuestCharge,
                totalAmount,
                maxAllowedGuests,
                exceedsMaxCapacity,
                childAgeLimit: childLimit,
                acStatus
              }
            });
          });
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), pricingApiPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
