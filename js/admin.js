// SHREE YATRI NIVAS - Admin Dashboard Logic

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const loginOverlay = document.getElementById("admin-login-modal");
  const loginForm = document.getElementById("admin-login-form");
  const loginError = document.getElementById("login-error-msg");
  const logoutBtn = document.getElementById("admin-logout-btn");
  const sidebarNavItems = document.querySelectorAll(".admin-nav-item");
  const tabSections = document.querySelectorAll(".admin-tab-section");

  // Check login status
  function checkAuth() {
    if (!StorageService.isAdminLoggedIn()) {
      if (loginOverlay) loginOverlay.classList.add("active");
    } else {
      if (loginOverlay) loginOverlay.classList.remove("active");
      loadDashboardData();
    }
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = document.getElementById("admin-username").value;
      const p = document.getElementById("admin-password").value;

      if (StorageService.adminLogin(u, p)) {
        loginOverlay.classList.remove("active");
        window.showToast("Welcome back, Administrator!", "success");
        loadDashboardData();
      } else {
        if (loginError) {
          loginError.textContent = "Invalid username or password. (Default: admin / admin123)";
          loginError.style.display = "block";
        }
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      StorageService.adminLogout();
      window.location.reload();
    });
  }

  // Tab Navigation
  sidebarNavItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetTab = item.getAttribute("data-tab");
      if (!targetTab) return;

      sidebarNavItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      tabSections.forEach(sec => {
        if (sec.id === `tab-${targetTab}`) {
          sec.classList.add("active");
        } else {
          sec.classList.remove("active");
        }
      });

      // Refresh specific tab data
      if (targetTab === "dashboard") loadDashboardData();
      if (targetTab === "rooms") renderRoomsTable();
      if (targetTab === "bookings") renderBookingsTable();
      if (targetTab === "reviews") renderReviewsTable();
      if (targetTab === "reports") renderReports();
    });
  });

  // Load Dashboard Data & KPIs
  function loadDashboardData() {
    const stats = StorageService.getDashboardStats();

    const elTotalRooms = document.getElementById("kpi-total-rooms");
    const elTotalBookings = document.getElementById("kpi-total-bookings");
    const elCheckIns = document.getElementById("kpi-today-checkins");
    const elUpcoming = document.getElementById("kpi-upcoming");
    const elRevenue = document.getElementById("kpi-revenue");
    const elPending = document.getElementById("kpi-pending-payments");
    const reviewBadge = document.getElementById("nav-review-badge");

    if (elTotalRooms) elTotalRooms.textContent = stats.totalRooms;
    if (elTotalBookings) elTotalBookings.textContent = stats.totalBookings;
    if (elCheckIns) elCheckIns.textContent = stats.todayCheckIns;
    if (elUpcoming) elUpcoming.textContent = stats.upcomingBookings;
    if (elRevenue) elRevenue.textContent = `₹${stats.totalRevenue.toLocaleString('en-IN')}`;
    if (elPending) elPending.textContent = `₹${stats.pendingPayments.toLocaleString('en-IN')}`;

    if (reviewBadge) {
      if (stats.pendingReviewsCount > 0) {
        reviewBadge.style.display = "inline-block";
        reviewBadge.textContent = stats.pendingReviewsCount;
      } else {
        reviewBadge.style.display = "none";
      }
    }

    renderRecentBookings();
  }

  // Render Recent Bookings on Dashboard
  function renderRecentBookings() {
    const tbody = document.getElementById("dashboard-recent-bookings-tbody");
    if (!tbody) return;

    const bookings = StorageService.getBookings().slice(0, 5);
    if (bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#64748b;padding:2rem;">No bookings recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td><strong>${b.booking_id}</strong></td>
        <td>${b.guest_name}<br><small style="color:#64748b;">${b.mobile}</small></td>
        <td>${b.room_name} (x${b.room_quantity || 1})</td>
        <td>${b.check_in} &rarr; ${b.check_out}</td>
        <td><strong>&#8377;${(b.total_amount || 0).toLocaleString('en-IN')}</strong></td>
        <td>
          <span class="badge ${getStatusBadgeClass(b.booking_status)}">${b.booking_status}</span>
        </td>
        <td>
          <span class="badge ${b.payment_status === 'Paid' ? 'badge-paid' : 'badge-pending'}">${b.payment_status}</span>
        </td>
      </tr>
    `).join("");
  }

  // ==========================================
  // ROOMS MANAGEMENT
  // ==========================================
  function renderRoomsTable() {
    const tbody = document.getElementById("admin-rooms-tbody");
    if (!tbody) return;

    const rooms = StorageService.getRooms(true);
    tbody.innerHTML = rooms.map(r => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <img src="${r.images[0]}" alt="${r.room_name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;">
            <div>
              <strong>${r.room_name}</strong>
              <div style="font-size:0.75rem;color:#64748b;">ID: ${r.room_id}</div>
            </div>
          </div>
        </td>
        <td>${r.room_type}</td>
        <td>
          <span class="badge ${r.ac_status === 'AC' ? 'badge-confirmed' : 'badge-checked-in'}">${r.ac_status}</span>
        </td>
        <td><strong>&#8377;${r.price.toLocaleString('en-IN')}</strong> / night</td>
        <td>${r.capacity} Guests</td>
        <td>${r.total_quantity} Units</td>
        <td>
          <span class="badge ${r.status === 'active' ? 'badge-paid' : 'badge-cancelled'}">
            ${r.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" title="Edit Room" onclick="openEditRoomModal('${r.room_id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon" title="Toggle Status" onclick="toggleRoomStatus('${r.room_id}')">
              <i class="fa-solid ${r.status === 'active' ? 'fa-eye-slash' : 'fa-eye'}"></i>
            </button>
            <button class="btn-icon danger" title="Delete Room" onclick="deleteRoomItem('${r.room_id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  window.openEditRoomModal = function (roomId) {
    const modal = document.getElementById("room-edit-modal");
    const title = document.getElementById("room-modal-title");
    const form = document.getElementById("room-edit-form");

    if (roomId) {
      const room = StorageService.getRoomById(roomId);
      if (!room) return;
      title.textContent = "Edit Room Details";
      document.getElementById("edit-room-id").value = room.room_id;
      document.getElementById("edit-room-name").value = room.room_name;
      document.getElementById("edit-room-type").value = room.room_type;
      document.getElementById("edit-room-ac").value = room.ac_status;
      document.getElementById("edit-room-price").value = room.price;
      document.getElementById("edit-room-capacity").value = room.capacity;
      document.getElementById("edit-room-quantity").value = room.total_quantity;
      document.getElementById("edit-room-desc").value = room.description;
      document.getElementById("edit-room-img").value = room.images[0] || "";
    } else {
      title.textContent = "Add New Room";
      form.reset();
      document.getElementById("edit-room-id").value = "";
    }

    modal.classList.add("active");
  };

  window.closeEditRoomModal = function () {
    const modal = document.getElementById("room-edit-modal");
    if (modal) modal.classList.remove("active");
  };

  const roomEditForm = document.getElementById("room-edit-form");
  if (roomEditForm) {
    roomEditForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-room-id").value;
      const name = document.getElementById("edit-room-name").value.trim();
      const type = document.getElementById("edit-room-type").value;
      const ac = document.getElementById("edit-room-ac").value;
      const price = parseInt(document.getElementById("edit-room-price").value, 10);
      const capacity = parseInt(document.getElementById("edit-room-capacity").value, 10);
      const total_quantity = parseInt(document.getElementById("edit-room-quantity").value, 10);
      const desc = document.getElementById("edit-room-desc").value.trim();
      const img = document.getElementById("edit-room-img").value.trim() || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80";

      const roomPayload = {
        room_id: id || undefined,
        room_name: name,
        room_type: type,
        ac_status: ac,
        price: price,
        capacity: capacity,
        total_quantity: total_quantity,
        available_quantity: total_quantity,
        description: desc,
        status: "active",
        images: [img]
      };

      StorageService.saveRoom(roomPayload);
      closeEditRoomModal();
      renderRoomsTable();
      loadDashboardData();
      window.showToast("Room saved successfully!", "success");
    });
  }

  window.toggleRoomStatus = function (roomId) {
    const room = StorageService.getRoomById(roomId);
    if (room) {
      room.status = room.status === "active" ? "inactive" : "active";
      StorageService.saveRoom(room);
      renderRoomsTable();
      window.showToast(`Room is now ${room.status}.`, "info");
    }
  };

  window.deleteRoomItem = function (roomId) {
    if (confirm("Are you sure you want to delete this room? This cannot be undone.")) {
      StorageService.deleteRoom(roomId);
      renderRoomsTable();
      loadDashboardData();
      window.showToast("Room deleted.", "info");
    }
  };

  // ==========================================
  // BOOKINGS MANAGEMENT
  // ==========================================
  const bookingSearchInput = document.getElementById("booking-search-input");
  const bookingStatusFilter = document.getElementById("booking-filter-status");

  function renderBookingsTable() {
    const tbody = document.getElementById("admin-bookings-tbody");
    if (!tbody) return;

    let bookings = StorageService.getBookings();
    const query = bookingSearchInput ? bookingSearchInput.value.toLowerCase().trim() : "";
    const statusFilter = bookingStatusFilter ? bookingStatusFilter.value : "all";

    if (query) {
      bookings = bookings.filter(b => 
        b.booking_id.toLowerCase().includes(query) ||
        b.guest_name.toLowerCase().includes(query) ||
        (b.mobile && b.mobile.includes(query)) ||
        b.room_name.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      bookings = bookings.filter(b => b.booking_status === statusFilter);
    }

    if (bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#64748b;padding:2rem;">No bookings found.</td></tr>`;
      return;
    }

    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td><strong>${b.booking_id}</strong></td>
        <td>
          <strong>${b.guest_name}</strong><br>
          <small style="color:#64748b;">${b.mobile}</small><br>
          <small style="color:#94a3b8;">${b.email}</small>
        </td>
        <td>
          ${b.room_name}<br>
          <small style="color:#64748b;">${b.room_quantity || 1} Room(s) | ${b.adults || 1} Adults</small>
        </td>
        <td>
          <strong>In:</strong> ${b.check_in}<br>
          <strong>Out:</strong> ${b.check_out} (${b.number_of_nights}N)
        </td>
        <td><strong>&#8377;${(b.total_amount || 0).toLocaleString('en-IN')}</strong></td>
        <td>
          <select onchange="updateBookingStatus('${b.booking_id}', this.value)" style="padding:4px 8px;border-radius:6px;font-size:0.85rem;border:1px solid #cbd5e1;font-weight:600;">
            <option value="Pending" ${b.booking_status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Confirmed" ${b.booking_status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Checked-in" ${b.booking_status === 'Checked-in' ? 'selected' : ''}>Checked-in</option>
            <option value="Checked-out" ${b.booking_status === 'Checked-out' ? 'selected' : ''}>Checked-out</option>
            <option value="Cancelled" ${b.booking_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>
          <button onclick="togglePaymentStatus('${b.booking_id}', '${b.payment_status === 'Paid' ? 'Pending' : 'Paid'}')"
                  class="badge ${b.payment_status === 'Paid' ? 'badge-paid' : 'badge-pending'}" 
                  style="border:none;cursor:pointer;padding:0.4rem 0.8rem;" title="Click to toggle Paid/Pending">
            ${b.payment_status === 'Paid' ? '<i class="fa-solid fa-check"></i> Paid' : '<i class="fa-solid fa-clock"></i> Mark Paid'}
          </button>
        </td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" title="View Voucher" onclick="viewBookingVoucherModal('${b.booking_id}')">
              <i class="fa-solid fa-receipt"></i>
            </button>
            <button class="btn-icon danger" title="Cancel Booking" onclick="updateBookingStatus('${b.booking_id}', 'Cancelled')">
              <i class="fa-solid fa-ban"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  if (bookingSearchInput) bookingSearchInput.addEventListener("input", renderBookingsTable);
  if (bookingStatusFilter) bookingStatusFilter.addEventListener("change", renderBookingsTable);

  window.updateBookingStatus = function (bookingId, newStatus) {
    if (StorageService.updateBookingStatus(bookingId, newStatus)) {
      renderBookingsTable();
      loadDashboardData();
      window.showToast(`Booking ${bookingId} status updated to ${newStatus}.`, "success");
    }
  };

  window.togglePaymentStatus = function (bookingId, newPaymentStatus) {
    if (StorageService.updatePaymentStatus(bookingId, newPaymentStatus)) {
      renderBookingsTable();
      loadDashboardData();
      window.showToast(`Payment for ${bookingId} marked as ${newPaymentStatus}.`, "success");
    }
  };

  window.viewBookingVoucherModal = function (bookingId) {
    const b = StorageService.getBookingById(bookingId);
    if (!b) return;

    let modal = document.getElementById("admin-voucher-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "admin-voucher-modal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 580px;">
        <div class="modal-header">
          <h3 class="modal-title">Booking Voucher: ${b.booking_id}</h3>
          <button class="modal-close-btn" onclick="modal.classList.remove('active')">&times;</button>
        </div>
        <div class="modal-body" style="font-size:0.92rem;line-height:1.7;">
          <div style="background:#f8fafc;padding:1.25rem;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:1.25rem;">
            <p><strong>Property:</strong> SHREE YATRI NIVAS, Pandharpur</p>
            <p><strong>Guest Name:</strong> ${b.guest_name}</p>
            <p><strong>Contact:</strong> ${b.mobile} | ${b.email}</p>
            <p><strong>Room:</strong> ${b.room_name} (x${b.room_quantity || 1})</p>
            <p><strong>Stay Dates:</strong> ${b.check_in} to ${b.check_out} (${b.number_of_nights} Nights)</p>
            <p><strong>Total Amount:</strong> &#8377;${(b.total_amount || 0).toLocaleString('en-IN')}</p>
            <p><strong>Payment Status:</strong> <span class="badge ${b.payment_status === 'Paid' ? 'badge-paid' : 'badge-pending'}">${b.payment_status}</span> (${b.payment_method})</p>
            <p><strong>Booking Status:</strong> <span class="badge ${getStatusBadgeClass(b.booking_status)}">${b.booking_status}</span></p>
            ${b.special_requests ? `<p style="margin-top:0.5rem;color:#b45309;"><strong>Special Requests:</strong> ${b.special_requests}</p>` : ''}
          </div>
          <div style="display:flex;justify-content:flex-end;gap:0.75rem;">
            <button class="btn btn-outline" onclick="window.print()">Print Voucher</button>
            <button class="btn btn-navy" onclick="modal.classList.remove('active')">Close</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
  };

  // ==========================================
  // REVIEWS MODERATION
  // ==========================================
  function renderReviewsTable() {
    const tbody = document.getElementById("admin-reviews-tbody");
    if (!tbody) return;

    const reviews = StorageService.getReviews(true);
    if (reviews.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#64748b;padding:2rem;">No reviews submitted yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = reviews.map(r => `
      <tr>
        <td><strong>${r.guest_name}</strong><br><small style="color:#64748b;">${r.city || 'Guest'}</small></td>
        <td>${r.room_type}</td>
        <td><span style="color:#d97706;font-weight:700;">★ ${r.rating}</span></td>
        <td style="max-width:320px;font-size:0.85rem;line-height:1.5;">${r.comment}</td>
        <td>${r.date}</td>
        <td>
          <span class="badge ${r.status === 'approved' ? 'badge-paid' : 'badge-pending'}">
            ${r.status === 'approved' ? 'Approved' : 'Pending Approval'}
          </span>
        </td>
        <td>
          <div class="action-btns">
            ${r.status === 'pending' ? `
              <button class="btn-icon" style="color:#059669;border-color:#10b981;" title="Approve Review" onclick="approveReviewItem('${r.id}')">
                <i class="fa-solid fa-check"></i>
              </button>
            ` : ''}
            <button class="btn-icon danger" title="Delete Review" onclick="deleteReviewItem('${r.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  window.approveReviewItem = function (id) {
    if (StorageService.approveReview(id)) {
      renderReviewsTable();
      loadDashboardData();
      window.showToast("Review approved and published to website!", "success");
    }
  };

  window.deleteReviewItem = function (id) {
    if (confirm("Delete this review permanently?")) {
      StorageService.deleteReview(id);
      renderReviewsTable();
      loadDashboardData();
      window.showToast("Review deleted.", "info");
    }
  };

  // ==========================================
  // REPORTS
  // ==========================================
  function renderReports() {
    const stats = StorageService.getDashboardStats();
    const bookings = StorageService.getBookings();

    const elRepRevenue = document.getElementById("rep-total-revenue");
    const elRepPending = document.getElementById("rep-pending-revenue");
    const elRepBookings = document.getElementById("rep-total-bookings");
    const tbody = document.getElementById("rep-room-performance-tbody");

    if (elRepRevenue) elRepRevenue.textContent = `₹${stats.totalRevenue.toLocaleString('en-IN')}`;
    if (elRepPending) elRepPending.textContent = `₹${stats.pendingPayments.toLocaleString('en-IN')}`;
    if (elRepBookings) elRepBookings.textContent = stats.totalBookings;

    if (tbody) {
      const rooms = StorageService.getRooms(true);
      const roomCounts = {};
      const roomRevenues = {};

      rooms.forEach(r => {
        roomCounts[r.room_name] = 0;
        roomRevenues[r.room_name] = 0;
      });

      bookings.forEach(b => {
        if (b.booking_status !== "Cancelled") {
          roomCounts[b.room_name] = (roomCounts[b.room_name] || 0) + (parseInt(b.room_quantity, 10) || 1);
          if (b.payment_status === "Paid") {
            roomRevenues[b.room_name] = (roomRevenues[b.room_name] || 0) + (b.total_amount || 0);
          }
        }
      });

      tbody.innerHTML = rooms.map(r => `
        <tr>
          <td><strong>${r.room_name}</strong></td>
          <td>${r.room_type} (${r.ac_status})</td>
          <td>${roomCounts[r.room_name] || 0} Bookings</td>
          <td>&#8377;${(roomRevenues[r.room_name] || 0).toLocaleString('en-IN')}</td>
          <td>
            <div style="background:#e2e8f0;border-radius:999px;height:8px;overflow:hidden;width:120px;">
              <div style="background:#d97706;height:100%;width:${Math.min(100, ((roomCounts[r.room_name] || 0) / Math.max(1, bookings.length)) * 100)}%;"></div>
            </div>
          </td>
        </tr>
      `).join("");
    }
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case "Confirmed": return "badge-confirmed";
      case "Checked-in": return "badge-checked-in";
      case "Checked-out": return "badge-checked-out";
      case "Cancelled": return "badge-cancelled";
      default: return "badge-pending";
    }
  }

  // Initial Auth Check
  checkAuth();
});
