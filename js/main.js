// SHREE YATRI NIVAS - Main Navigation, Customer Auth & Global Utilities

document.addEventListener("DOMContentLoaded", () => {
  // Sticky Navbar Scroll Effect
  const navbarWrapper = document.querySelector(".navbar-wrapper");
  if (navbarWrapper) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        navbarWrapper.classList.add("scrolled");
      } else {
        navbarWrapper.classList.remove("scrolled");
      }
    });
  }

  // Mobile Menu Toggle
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      navLinks.classList.toggle("mobile-open");
      const icon = mobileToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
      }
    });

    // Close mobile menu when clicking any nav link
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("mobile-open");
        const icon = mobileToggle.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      });
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove("mobile-open");
        const icon = mobileToggle.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      }
    });
  }

  // Floating WhatsApp direct link
  const whatsappBtns = document.querySelectorAll(".whatsapp-trigger");
  whatsappBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const message = encodeURIComponent("Namaste! I would like to inquire about room availability and booking at SHREE YATRI NIVAS.");
      const whatsappUrl = `https://wa.me/${PROPERTY_INFO.whatsapp}?text=${message}`;
      window.open(whatsappUrl, "_blank");
    });
  });

  // Setup Datepicker Defaults (min = today)
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const checkInInputs = document.querySelectorAll("input[name='check_in'], #check_in");
  const checkOutInputs = document.querySelectorAll("input[name='check_out'], #check_out");

  checkInInputs.forEach(input => {
    if (!input.value) input.value = todayStr;
    input.min = todayStr;
    input.addEventListener("change", () => {
      const selected = new Date(input.value);
      const nextDay = new Date(selected);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split("T")[0];

      checkOutInputs.forEach(outInput => {
        outInput.min = nextDayStr;
        if (new Date(outInput.value) <= selected) {
          outInput.value = nextDayStr;
        }
      });
    });
  });

  checkOutInputs.forEach(input => {
    if (!input.value) input.value = tomorrowStr;
    input.min = tomorrowStr;
  });

  // Render Customer Auth in Navbar
  window.renderCustomerNavState();
});

// Render Customer Auth State in Navbar (Both Desktop and Mobile)
window.renderCustomerNavState = function () {
  const customer = StorageService.getCurrentCustomer();
  const firstName = customer ? customer.name.split(" ")[0] : "";

  // 1. Desktop Nav Actions
  const navActions = document.querySelector(".nav-actions");
  if (navActions) {
    let slot = document.getElementById("customer-auth-slot");
    if (!slot) {
      slot = document.createElement("div");
      slot.id = "customer-auth-slot";
      const bookCta = navActions.querySelector(".nav-cta-btn");
      if (bookCta) {
        navActions.insertBefore(slot, bookCta);
      } else {
        navActions.appendChild(slot);
      }
    }

    if (customer) {
      slot.innerHTML = `
        <div class="customer-logged-pill" title="Logged in as ${customer.name}">
          <i class="fa-solid fa-circle-user"></i> Namaste, ${firstName}
          <a href="#" onclick="logoutCustomer(event)" class="logout-link" title="Logout">
            <i class="fa-solid fa-power-off"></i>
          </a>
        </div>
      `;
    } else {
      slot.innerHTML = `
        <a href="#" onclick="openCustomerAuthModal(event)" class="customer-login-nav-btn">
          <i class="fa-solid fa-circle-user"></i> Guest Sign In
        </a>
      `;
    }
  }

  // 2. Mobile Nav Drawer
  const mobileActions = document.querySelector(".nav-actions-mobile");
  if (mobileActions) {
    let mobSlot = document.getElementById("customer-auth-slot-mobile");
    if (!mobSlot) {
      mobSlot = document.createElement("div");
      mobSlot.id = "customer-auth-slot-mobile";
      mobileActions.insertBefore(mobSlot, mobileActions.firstChild);
    }

    if (customer) {
      mobSlot.innerHTML = `
        <div class="customer-logged-pill" style="width:100%; justify-content:center; padding:0.65rem 1rem;" title="Logged in as ${customer.name}">
          <i class="fa-solid fa-circle-user"></i> Namaste, ${customer.name}
          <a href="#" onclick="logoutCustomer(event)" class="logout-link" style="margin-left:0.5rem;" title="Logout">
            <i class="fa-solid fa-power-off"></i> Sign Out
          </a>
        </div>
      `;
    } else {
      mobSlot.innerHTML = `
        <a href="#" onclick="openCustomerAuthModal(event)" class="customer-login-nav-btn" style="width:100%; justify-content:center; padding:0.65rem 1rem;">
          <i class="fa-solid fa-circle-user"></i> Guest Sign In / Register
        </a>
      `;
    }
  }
};

// Customer Logout
window.logoutCustomer = function (e) {
  if (e) e.preventDefault();
  StorageService.customerLogout();
  window.renderCustomerNavState();
  window.showToast("You have been signed out.", "info");

  // If on booking page, trigger state update
  if (typeof window.onCustomerAuthChanged === "function") {
    window.onCustomerAuthChanged(null);
  }
};

// Open Customer Auth Modal (Login / Register)
let authModalCallback = null;
window.openCustomerAuthModal = function (eOrCallback) {
  if (typeof eOrCallback === "function") {
    authModalCallback = eOrCallback;
  } else if (eOrCallback && eOrCallback.preventDefault) {
    eOrCallback.preventDefault();
  }

  let modal = document.getElementById("customer-auth-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "customer-auth-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 480px;">
        <div style="background: var(--ink); color: #ffffff; padding: 2rem 2rem 1.5rem 2rem; text-align: center; position: relative;">
          <button class="modal-close-btn" style="position: absolute; top: 1rem; right: 1rem; color: #a3a29e;" onclick="closeCustomerAuthModal()">&times;</button>
          <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--gold); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.85rem auto; font-size: 1.15rem; color: #ffffff;">
            <i class="fa-solid fa-user-check"></i>
          </div>
          <h3 class="heading-serif" style="font-size: 1.65rem; margin-bottom: 0.25rem; color:#ffffff;">Guest Access</h3>
          <p style="color: #a3a29e; font-size: 0.85rem;">Sign in or register to book your room and view reservation details.</p>
        </div>

        <div class="modal-body" style="padding: 1.75rem 2rem;">
          <!-- Tabs -->
          <div class="auth-tabs-nav">
            <button class="auth-tab-btn active" id="tab-btn-login" onclick="switchAuthTab('login')">Sign In</button>
            <button class="auth-tab-btn" id="tab-btn-register" onclick="switchAuthTab('register')">New Register</button>
          </div>

          <!-- LOGIN TAB -->
          <div id="auth-tab-login" class="auth-tab-content active">
            <div id="cust-login-error" style="display:none; background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:0.75rem; border-radius:8px; font-size:0.85rem; margin-bottom:1rem;"></div>

            <form id="customer-login-form">
              <div class="form-group">
                <label class="form-label">Email or Mobile Number *</label>
                <input type="text" id="cust-login-id" class="form-control" placeholder="e.g. ramesh@example.com or 9823045671" required>
              </div>

              <div class="form-group">
                <label class="form-label">Password *</label>
                <input type="password" id="cust-login-pass" class="form-control" placeholder="Enter your password" required>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; margin-top: 0.5rem;">
                <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In to Account
              </button>
            </form>

            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 0.85rem; margin-top: 1.25rem; text-align: center;">
              <span style="font-size: 0.78rem; color: #64748b;">Want a quick test?</span><br>
              <button type="button" onclick="fillDemoCustomer()" style="background: none; border: none; color: #d97706; font-weight: 700; font-size: 0.85rem; cursor: pointer; text-decoration: underline; margin-top: 4px;">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Use Demo Account (Ramesh Sharma)
              </button>
            </div>
          </div>

          <!-- REGISTER TAB -->
          <div id="auth-tab-register" class="auth-tab-content">
            <div id="cust-register-error" style="display:none; background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:0.75rem; border-radius:8px; font-size:0.85rem; margin-bottom:1rem;"></div>

            <form id="customer-register-form">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input type="text" id="reg-name" class="form-control" placeholder="e.g. Anand Kulkarni" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                <div class="form-group">
                  <label class="form-label">Mobile (WhatsApp) *</label>
                  <input type="tel" id="reg-mobile" class="form-control" placeholder="10-digit mobile" required>
                </div>
                <div class="form-group">
                  <label class="form-label">City / State</label>
                  <input type="text" id="reg-city" class="form-control" placeholder="e.g. Pune">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Email Address *</label>
                <input type="email" id="reg-email" class="form-control" placeholder="name@example.com" required>
              </div>

              <div class="form-group">
                <label class="form-label">Create Password *</label>
                <input type="password" id="reg-pass" class="form-control" placeholder="Minimum 6 characters" required>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; margin-top: 0.5rem;">
                <i class="fa-solid fa-user-plus"></i> Register & Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Attach form handlers
    const loginForm = document.getElementById("customer-login-form");
    loginForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const loginId = document.getElementById("cust-login-id").value;
      const loginPass = document.getElementById("cust-login-pass").value;
      const res = StorageService.customerLogin(loginId, loginPass);

      if (res.success) {
        closeCustomerAuthModal();
        window.renderCustomerNavState();
        window.showToast(`Welcome back, ${res.customer.name}!`, "success");
        if (typeof authModalCallback === "function") {
          authModalCallback(res.customer);
          authModalCallback = null;
        }
        if (typeof window.onCustomerAuthChanged === "function") {
          window.onCustomerAuthChanged(res.customer);
        }
      } else {
        const err = document.getElementById("cust-login-error");
        err.textContent = res.message;
        err.style.display = "block";
      }
    });

    const regForm = document.getElementById("customer-register-form");
    regForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const name = document.getElementById("reg-name").value;
      const mobile = document.getElementById("reg-mobile").value;
      const city = document.getElementById("reg-city").value;
      const email = document.getElementById("reg-email").value;
      const pass = document.getElementById("reg-pass").value;

      if (pass.length < 4) {
        const err = document.getElementById("cust-register-error");
        err.textContent = "Password should be at least 4 characters.";
        err.style.display = "block";
        return;
      }

      const res = StorageService.customerRegister({
        name, mobile, city, email, password: pass
      });

      if (res.success) {
        closeCustomerAuthModal();
        window.renderCustomerNavState();
        window.showToast(`Account created successfully! Welcome, ${res.customer.name}`, "success");
        if (typeof authModalCallback === "function") {
          authModalCallback(res.customer);
          authModalCallback = null;
        }
        if (typeof window.onCustomerAuthChanged === "function") {
          window.onCustomerAuthChanged(res.customer);
        }
      } else {
        const err = document.getElementById("cust-register-error");
        err.textContent = res.message;
        err.style.display = "block";
      }
    });
  }

  modal.classList.add("active");
};

window.closeCustomerAuthModal = function () {
  const modal = document.getElementById("customer-auth-modal");
  if (modal) modal.classList.remove("active");
};

window.switchAuthTab = function (tab) {
  const btnLogin = document.getElementById("tab-btn-login");
  const btnReg = document.getElementById("tab-btn-register");
  const tabLogin = document.getElementById("auth-tab-login");
  const tabReg = document.getElementById("auth-tab-register");

  if (tab === "login") {
    btnLogin.classList.add("active");
    btnReg.classList.remove("active");
    tabLogin.classList.add("active");
    tabReg.classList.remove("active");
  } else {
    btnReg.classList.add("active");
    btnLogin.classList.remove("active");
    tabReg.classList.add("active");
    tabLogin.classList.remove("active");
  }
};

window.fillDemoCustomer = function () {
  document.getElementById("cust-login-id").value = "ramesh@example.com";
  document.getElementById("cust-login-pass").value = "password123";
  document.getElementById("customer-login-form").dispatchEvent(new Event("submit"));
};

// Global Toast Notification Helper
window.showToast = function (message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;

  const iconClass = type === "success" 
    ? "fa-circle-check" 
    : type === "error" 
      ? "fa-circle-exclamation" 
      : "fa-circle-info";

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <div style="flex: 1;">${message}</div>
    <button style="background:none;border:none;color:#94a3b8;cursor:pointer;" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-times"></i>
    </button>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 20);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
};
