// SHREE YATRI NIVAS - Rooms Listing & Interactive Filter Logic

document.addEventListener("DOMContentLoaded", () => {
  const roomsContainer = document.getElementById("rooms-container");
  const filterType = document.getElementById("filter-type");
  const filterAc = document.getElementById("filter-ac");
  const filterCapacity = document.getElementById("filter-capacity");
  const filterPrice = document.getElementById("filter-price");
  const priceDisplay = document.getElementById("price-display");
  const searchForm = document.getElementById("availability-search-form");

  let currentCheckIn = "";
  let currentCheckOut = "";

  // Parse URL query params if any
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("check_in")) currentCheckIn = urlParams.get("check_in");
  if (urlParams.has("check_out")) currentCheckOut = urlParams.get("check_out");

  function renderRooms() {
    if (!roomsContainer) return;
    const allRooms = StorageService.getRooms();

    // Filters
    const typeVal = filterType ? filterType.value : "all";
    const acVal = filterAc ? filterAc.value : "all";
    const capVal = filterCapacity ? parseInt(filterCapacity.value, 10) || 0 : 0;
    const maxPrice = filterPrice ? parseInt(filterPrice.value, 10) : 10000;

    const filtered = allRooms.filter(room => {
      if (typeVal !== "all" && room.room_type !== typeVal) return false;
      if (acVal !== "all" && room.ac_status !== acVal) return false;
      if (capVal > 0 && room.capacity < capVal) return false;
      if (room.price > maxPrice) return false;
      return true;
    });

    if (filtered.length === 0) {
      roomsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: #ffffff; border-radius: 16px; border: 1px dashed #cbd5e1;">
          <i class="fa-solid fa-bed" style="font-size: 3rem; color: #94a3b8; margin-bottom: 1rem;"></i>
          <h3 style="font-size: 1.4rem; color: #0f172a; margin-bottom: 0.5rem;">No Rooms Match Your Criteria</h3>
          <p style="color: #64748b; margin-bottom: 1.5rem;">Try adjusting your filters or dates to find available rooms.</p>
          <button class="btn btn-primary" onclick="resetRoomFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    roomsContainer.innerHTML = filtered.map(room => {
      // Calculate availability for current dates
      const availCheck = StorageService.checkRoomAvailability(room.room_id, currentCheckIn, currentCheckOut, 1);
      const isAvailable = availCheck.available;
      const remaining = availCheck.remainingQty;

      const availBadge = isAvailable
        ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;font-weight:700;color:#059669;background:#ecfdf5;padding:2px 8px;border-radius:9999px;">
             <i class="fa-solid fa-circle-check"></i> ${remaining} Available
           </span>`
        : `<span style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;font-weight:700;color:#dc2626;background:#fef2f2;padding:2px 8px;border-radius:9999px;">
             <i class="fa-solid fa-circle-xmark"></i> Sold Out
           </span>`;

      const amenityChips = (room.amenities || []).slice(0, 4).map(a => `
        <span class="amenity-chip"><i class="fa-solid fa-check"></i> ${a}</span>
      `).join("");

      return `
        <div class="room-card" data-room-id="${room.room_id}">
          <div class="room-card-image-wrap">
            <img src="${room.images[0]}" alt="${room.room_name}" class="room-card-img" loading="lazy">
            <div class="room-badge">${room.badge || room.room_type}</div>
            <div class="room-ac-pill ${room.ac_status === 'AC' ? 'ac' : 'non-ac'}">${room.ac_status}</div>
          </div>
          <div class="room-card-content">
            <div class="room-meta-header">
              <div class="room-rating-pill">
                <i class="fa-solid fa-star"></i> ${room.rating || 4.8}
              </div>
              <div class="room-capacity">
                <i class="fa-solid fa-user-group"></i> Up to ${room.capacity} Guests
              </div>
            </div>
            <h3 class="room-title">${room.room_name}</h3>
            <p class="room-description">${room.description}</p>
            <div class="room-amenities-pills">
              ${amenityChips}
            </div>
            <div style="margin-bottom: 0.75rem;">
              ${availBadge}
            </div>
            <div class="room-card-footer">
              <div class="room-price-wrap">
                <span class="room-price-label">Starting From</span>
                <div class="room-price">&#8377;${room.price.toLocaleString('en-IN')} <span>/ night</span></div>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-outline" style="padding: 0.6rem 0.9rem; font-size: 0.85rem;" onclick="openRoomModal('${room.room_id}')">
                  Details
                </button>
                <a href="booking.html?room=${room.room_id}${currentCheckIn ? `&check_in=${currentCheckIn}&check_out=${currentCheckOut}` : ''}" 
                   class="room-book-btn ${!isAvailable ? 'disabled' : ''}" 
                   style="${!isAvailable ? 'pointer-events:none;opacity:0.5;' : ''}">
                  Book Now <i class="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Filter Listeners
  if (filterType) filterType.addEventListener("change", renderRooms);
  if (filterAc) filterAc.addEventListener("change", renderRooms);
  if (filterCapacity) filterCapacity.addEventListener("change", renderRooms);
  if (filterPrice) {
    filterPrice.addEventListener("input", (e) => {
      if (priceDisplay) priceDisplay.textContent = `₹${parseInt(e.target.value).toLocaleString('en-IN')}`;
      renderRooms();
    });
  }

  // Availability Search Form Submission
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const inVal = searchForm.querySelector("[name='check_in']").value;
      const outVal = searchForm.querySelector("[name='check_out']").value;
      currentCheckIn = inVal;
      currentCheckOut = outVal;
      renderRooms();
      window.showToast("Availability updated for your chosen dates!", "info");
    });
  }

  window.resetRoomFilters = function () {
    if (filterType) filterType.value = "all";
    if (filterAc) filterAc.value = "all";
    if (filterCapacity) filterCapacity.value = "0";
    if (filterPrice) {
      filterPrice.value = "5000";
      if (priceDisplay) priceDisplay.textContent = "₹5,000";
    }
    renderRooms();
  };

  // Quick Room Details Modal
  window.openRoomModal = function (roomId) {
    const room = StorageService.getRoomById(roomId);
    if (!room) return;

    let modal = document.getElementById("room-details-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "room-details-modal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    const allAmenities = (room.amenities || []).map(a => `
      <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;color:#334155;">
        <i class="fa-solid fa-circle-check" style="color:#d97706;"></i> ${a}
      </div>
    `).join("");

    const galleryThumbs = (room.images || []).map((img, idx) => `
      <img src="${img}" alt="Preview ${idx}" 
           style="width: 80px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid ${idx === 0 ? '#d97706' : 'transparent'};"
           onclick="document.getElementById('modal-main-img').src='${img}'">
    `).join("");

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 720px;">
        <div class="modal-header">
          <h3 class="modal-title">${room.room_name}</h3>
          <button class="modal-close-btn" onclick="closeRoomModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 1rem; position: relative;">
            <img id="modal-main-img" src="${room.images[0]}" alt="${room.room_name}" 
                 style="width: 100%; height: 320px; object-fit: cover; border-radius: 12px;">
            <span class="room-ac-pill ${room.ac_status === 'AC' ? 'ac' : 'non-ac'}" style="position:absolute;top:1rem;right:1rem;">
              ${room.ac_status}
            </span>
          </div>
          <div style="display:flex; gap:0.5rem; margin-bottom: 1.5rem; overflow-x: auto;">
            ${galleryThumbs}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
            <div style="font-size:1.5rem; font-weight:800; color:#0f172a;">
              &#8377;${room.price.toLocaleString('en-IN')} <span style="font-size:0.9rem; color:#64748b; font-weight:normal;">/ night</span>
            </div>
            <div style="font-size:0.9rem; font-weight:600; color:#64748b;">
              <i class="fa-solid fa-user-group"></i> Max ${room.capacity} Guests
            </div>
          </div>
          <p style="color:#475569; font-size:0.95rem; line-height:1.7; margin-bottom: 1.5rem;">
            ${room.description}
          </p>
          <h4 style="font-size:1.05rem; margin-bottom:0.75rem; color:#0f172a;">Included Amenities</h4>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.6rem; margin-bottom: 1.5rem;">
            ${allAmenities}
          </div>
          <div style="background:#f8fafc; border-radius:10px; padding:1rem; border:1px solid #e2e8f0; margin-bottom:1.5rem; font-size:0.85rem; color:#64748b;">
            <p><strong>Child Policy:</strong> Children under 4 years stay free of charge without extra bed.</p>
            <p style="margin-top:0.3rem;"><strong>Payment Method:</strong> Pay at property / check-in (Cash / UPI accepted).</p>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button class="btn btn-outline" onclick="closeRoomModal()">Close</button>
            <a href="booking.html?room=${room.room_id}" class="btn btn-primary">Proceed to Booking <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
  };

  window.closeRoomModal = function () {
    const modal = document.getElementById("room-details-modal");
    if (modal) modal.classList.remove("active");
  };

  // Initial render
  renderRooms();
});
