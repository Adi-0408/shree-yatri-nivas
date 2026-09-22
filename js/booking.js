// SHREE YATRI NIVAS - Online Booking Engine Logic

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-wizard-form");
  const roomSelect = document.getElementById("book-room-select");
  const checkInInput = document.getElementById("book-check-in");
  const checkOutInput = document.getElementById("book-check-out");
  const roomQtyInput = document.getElementById("book-room-qty");
  const adultsInput = document.getElementById("book-adults");
  const childrenInput = document.getElementById("book-children");

  // Summary elements
  const summaryRoomName = document.getElementById("summary-room-name");
  const summaryDates = document.getElementById("summary-dates");
  const summaryNights = document.getElementById("summary-nights");
  const summaryGuests = document.getElementById("summary-guests");
  const summaryRate = document.getElementById("summary-rate");
  const summarySubtotal = document.getElementById("summary-subtotal");
  const summaryTotal = document.getElementById("summary-total");
  const availabilityAlert = document.getElementById("availability-alert");

  // Customer Authentication Enforcement
  function evaluateCustomerAuth() {
    const authRequiredCard = document.getElementById("booking-auth-required");
    const wizardCard = document.getElementById("booking-wizard-card");
    const statusBar = document.getElementById("booking-customer-status-bar");
    const custBarName = document.getElementById("cust-bar-name");
    const custBarContact = document.getElementById("cust-bar-contact");

    const customer = StorageService.getCurrentCustomer();

    if (!customer) {
      if (authRequiredCard) authRequiredCard.style.display = "block";
      if (wizardCard) wizardCard.style.display = "none";
      if (statusBar) statusBar.style.display = "none";
      return false;
    } else {
      if (authRequiredCard) authRequiredCard.style.display = "none";
      if (wizardCard) wizardCard.style.display = "block";
      if (statusBar) statusBar.style.display = "block";
      if (custBarName) custBarName.textContent = `Logged In: ${customer.name}`;
      if (custBarContact) custBarContact.textContent = `${customer.mobile} • ${customer.email} (${customer.city || 'Devotee'})`;

      // Prepopulate Step 2 guest fields
      const nameInput = document.getElementById("guest-name");
      const phoneInput = document.getElementById("guest-phone");
      const emailInput = document.getElementById("guest-email");
      if (nameInput && !nameInput.value) nameInput.value = customer.name;
      if (phoneInput && !phoneInput.value) phoneInput.value = customer.mobile;
      if (emailInput && !emailInput.value) emailInput.value = customer.email;

      return true;
    }
  }

  // Listen for global auth changes (login/logout)
  window.onCustomerAuthChanged = function () {
    evaluateCustomerAuth();
  };

  // Evaluate on load
  evaluateCustomerAuth();

  // Populate rooms select dropdown
  const rooms = StorageService.getRooms();
  if (roomSelect) {
    roomSelect.innerHTML = rooms.map(r => `
      <option value="${r.room_id}" data-rate="${r.price}" data-cap="${r.capacity}">
        ${r.room_name} (${r.ac_status}) - &#8377;${r.price.toLocaleString('en-IN')}/night
      </option>
    `).join("");

    // Check query param for room pre-selection
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("room")) {
      const targetRoom = urlParams.get("room");
      if (rooms.some(r => r.room_id === targetRoom)) {
        roomSelect.value = targetRoom;
      }
    }
    if (urlParams.has("check_in")) checkInInput.value = urlParams.get("check_in");
    if (urlParams.has("check_out")) checkOutInput.value = urlParams.get("check_out");
  }

  // Calculate & Refresh Pricing
  function calculatePricing() {
    if (!roomSelect || !checkInInput || !checkOutInput) return;

    const roomId = roomSelect.value;
    const room = StorageService.getRoomById(roomId);
    if (!room) return;

    const checkInDate = new Date(checkInInput.value);
    const checkOutDate = new Date(checkOutInput.value);
    const qty = parseInt(roomQtyInput.value || 1, 10);
    const adults = parseInt(adultsInput.value || 2, 10);
    const children = parseInt(childrenInput.value || 0, 10);

    let nights = 1;
    if (checkOutDate > checkInDate) {
      const diffTime = Math.abs(checkOutDate - checkInDate);
      nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    if (nights < 1) nights = 1;

    // Check live availability
    const avail = StorageService.checkRoomAvailability(roomId, checkInInput.value, checkOutInput.value, qty);
    if (availabilityAlert) {
      if (!avail.available) {
        availabilityAlert.style.display = "flex";
        availabilityAlert.innerHTML = `
          <i class="fa-solid fa-circle-exclamation" style="margin-top:2px;"></i>
          <div>
            <strong>High Demand:</strong> Only ${avail.remainingQty} room(s) available for these selected dates. Please lower the room quantity or choose different dates.
          </div>
        `;
      } else {
        availabilityAlert.style.display = "none";
      }
    }

    const rate = room.price;
    const total = rate * nights * qty;

    // Update UI Summary Elements
    if (summaryRoomName) summaryRoomName.textContent = room.room_name;
    if (summaryDates) summaryDates.textContent = `${checkInInput.value} to ${checkOutInput.value}`;
    if (summaryNights) summaryNights.textContent = `${nights} Night${nights > 1 ? 's' : ''}`;
    if (summaryGuests) summaryGuests.textContent = `${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child(ren)` : ''} | ${qty} Room${qty > 1 ? 's' : ''}`;
    if (summaryRate) summaryRate.textContent = `₹${rate.toLocaleString('en-IN')}`;
    if (summarySubtotal) summarySubtotal.textContent = `₹${rate.toLocaleString('en-IN')} × ${nights}N × ${qty}R`;
    if (summaryTotal) summaryTotal.textContent = `₹${total.toLocaleString('en-IN')}`;

    return { room, nights, qty, adults, children, rate, total };
  }

  // Event Listeners for Live Calculation
  [roomSelect, checkInInput, checkOutInput, roomQtyInput, adultsInput, childrenInput].forEach(elem => {
    if (elem) elem.addEventListener("change", calculatePricing);
  });

  calculatePricing();

  // Wizard Step Navigation
  window.nextStep = function (currentStep) {
    if (!StorageService.isCustomerLoggedIn()) {
      window.showToast("Please sign in or register to continue booking.", "error");
      openCustomerAuthModal();
      return;
    }

    const currentElem = document.getElementById(`step-${currentStep}`);
    const nextElem = document.getElementById(`step-${currentStep + 1}`);

    // Step 1 Validation
    if (currentStep === 1) {
      const pricing = calculatePricing();
      const avail = StorageService.checkRoomAvailability(roomSelect.value, checkInInput.value, checkOutInput.value, parseInt(roomQtyInput.value, 10));
      if (!avail.available) {
        window.showToast(`Cannot proceed: only ${avail.remainingQty} room(s) available.`, "error");
        return;
      }
      const checkInDate = new Date(checkInInput.value);
      const checkOutDate = new Date(checkOutInput.value);
      if (checkOutDate <= checkInDate) {
        window.showToast("Check-out date must be after check-in date.", "error");
        return;
      }
    }

    // Step 2 Validation (Guest Info)
    if (currentStep === 2) {
      const name = document.getElementById("guest-name").value.trim();
      const phone = document.getElementById("guest-phone").value.trim();
      const email = document.getElementById("guest-email").value.trim();

      if (!name || !phone || !email) {
        window.showToast("Please fill in your name, mobile number, and email.", "error");
        return;
      }
      if (phone.length < 10) {
        window.showToast("Please enter a valid 10-digit mobile number.", "error");
        return;
      }

      // Populate Step 3 final summary
      document.getElementById("review-guest-name").textContent = name;
      document.getElementById("review-guest-contact").textContent = `${phone} | ${email}`;
    }

    if (currentElem && nextElem) {
      currentElem.classList.remove("active");
      nextElem.classList.add("active");
      updateStepIndicators(currentStep + 1);
      window.scrollTo({ top: 100, behavior: "smooth" });
    }
  };

  window.prevStep = function (currentStep) {
    const currentElem = document.getElementById(`step-${currentStep}`);
    const prevElem = document.getElementById(`step-${currentStep - 1}`);
    if (currentElem && prevElem) {
      currentElem.classList.remove("active");
      prevElem.classList.add("active");
      updateStepIndicators(currentStep - 1);
      window.scrollTo({ top: 100, behavior: "smooth" });
    }
  };

  function updateStepIndicators(step) {
    const indicators = document.querySelectorAll(".step-indicator");
    indicators.forEach((ind, idx) => {
      if (idx + 1 === step) {
        ind.classList.add("active");
        ind.classList.remove("completed");
      } else if (idx + 1 < step) {
        ind.classList.remove("active");
        ind.classList.add("completed");
      } else {
        ind.classList.remove("active");
        ind.classList.remove("completed");
      }
    });
  }

  // Handle Booking Submission
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!StorageService.isCustomerLoggedIn()) {
        window.showToast("Please sign in or register before confirming your booking.", "error");
        openCustomerAuthModal();
        return;
      }

      const policyCheckbox = document.getElementById("policy-agree");
      if (policyCheckbox && !policyCheckbox.checked) {
        window.showToast("Please accept the cancellation & hotel policies to continue.", "error");
        return;
      }

      const customer = StorageService.getCurrentCustomer();
      const pricing = calculatePricing();
      const name = document.getElementById("guest-name").value.trim();
      const phone = document.getElementById("guest-phone").value.trim();
      const email = document.getElementById("guest-email").value.trim();
      const specialReq = document.getElementById("guest-requests").value.trim();

      const bookingPayload = {
        customer_id: customer ? customer.id : null,
        guest_name: name,
        mobile: phone,
        email: email,
        check_in: checkInInput.value,
        check_out: checkOutInput.value,
        adults: pricing.adults,
        children: pricing.children,
        room_id: pricing.room.room_id,
        room_name: pricing.room.room_name,
        room_type: pricing.room.room_type,
        room_quantity: pricing.qty,
        room_rate: pricing.rate,
        number_of_nights: pricing.nights,
        total_amount: pricing.total,
        special_requests: specialReq
      };

      try {
        const confirmedBooking = StorageService.createBooking(bookingPayload);
        showConfirmationScreen(confirmedBooking);
        window.showToast(`Booking Successful! Your ID is ${confirmedBooking.booking_id}`, "success");
      } catch (err) {
        window.showToast(err.message, "error");
      }
    });
  }

  function showConfirmationScreen(booking) {
    const wizardCard = document.getElementById("booking-wizard-card");
    const confirmCard = document.getElementById("confirmation-card");
    if (wizardCard && confirmCard) {
      wizardCard.style.display = "none";
      confirmCard.style.display = "block";

      // Render Confirmation Details
      document.getElementById("conf-id").textContent = booking.booking_id;
      document.getElementById("conf-guest").textContent = booking.guest_name;
      document.getElementById("conf-phone").textContent = booking.mobile;
      document.getElementById("conf-room").textContent = `${booking.room_name} (${booking.room_quantity} Room${booking.room_quantity > 1 ? 's' : ''})`;
      document.getElementById("conf-dates").textContent = `${booking.check_in} to ${booking.check_out} (${booking.number_of_nights} Night${booking.number_of_nights > 1 ? 's' : ''})`;
      document.getElementById("conf-total").textContent = `₹${booking.total_amount.toLocaleString('en-IN')}`;
      document.getElementById("conf-payment").textContent = "Pay at Property (Pending)";

      // Setup WhatsApp notification click for Admin
      const adminWaMsg = encodeURIComponent(`*NEW BOOKING ALERT - SHREE YATRI NIVAS*\n\nBooking ID: ${booking.booking_id}\nGuest: ${booking.guest_name}\nMobile: ${booking.mobile}\nRoom: ${booking.room_name} (Qty: ${booking.room_quantity})\nDates: ${booking.check_in} to ${booking.check_out}\nNights: ${booking.number_of_nights}\nTotal Amount: ₹${booking.total_amount}\nPayment: Pay at Property`);
      const waAdminBtn = document.getElementById("conf-wa-admin-btn");
      if (waAdminBtn) {
        waAdminBtn.href = `https://wa.me/${PROPERTY_INFO.whatsapp}?text=${adminWaMsg}`;
      }

      window.scrollTo({ top: 50, behavior: "smooth" });
    }
  }

  // Print voucher
  window.printBookingVoucher = function () {
    window.print();
  };
});
