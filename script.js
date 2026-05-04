const STORAGE_KEY = "nevulaLaunchCart";

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initHeaderState();
  initFaqAccordion();
  initCountdowns();
  initCartSimulation();
  initRevealOnScroll();
  initParallax();
});

function initMobileNav() {
  const toggleButton = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");

  if (!toggleButton || !navMenu) {
    return;
  }

  toggleButton.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      toggleButton.setAttribute("aria-expanded", "false");
    });
  });
}

function initHeaderState() {
  const header = document.querySelector(".site-header");

  if (!header) {
    return;
  }

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!button || !answer) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!isOpen));
      item.classList.toggle("is-open", !isOpen);
      answer.hidden = isOpen;
    });
  });
}

function initCountdowns() {
  const countdownElements = document.querySelectorAll("[data-countdown-target]");

  countdownElements.forEach((countdownElement) => {
    const targetDate = new Date(countdownElement.dataset.countdownTarget).getTime();
    const parts = {
      days: countdownElement.querySelector('[data-countdown-part="days"]'),
      hours: countdownElement.querySelector('[data-countdown-part="hours"]'),
      minutes: countdownElement.querySelector('[data-countdown-part="minutes"]'),
      seconds: countdownElement.querySelector('[data-countdown-part="seconds"]')
    };
    const note = countdownElement.querySelector("[data-countdown-note]");

    if (Number.isNaN(targetDate)) {
      if (note) {
        note.textContent = "Countdown date unavailable.";
      }
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const distance = targetDate - now;

      if (distance <= 0) {
        updateCountdownDisplay(parts, { days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (note) {
          note.textContent = "The entry window has closed.";
        }
        return false;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      updateCountdownDisplay(parts, { days, hours, minutes, seconds });
      return true;
    };

    const keepGoing = updateCountdown();

    if (!keepGoing) {
      return;
    }

    const timer = window.setInterval(() => {
      const shouldContinue = updateCountdown();

      if (!shouldContinue) {
        window.clearInterval(timer);
      }
    }, 1000);
  });
}

function updateCountdownDisplay(parts, values) {
  if (parts.days) {
    parts.days.textContent = String(values.days).padStart(3, "0");
  }
  if (parts.hours) {
    parts.hours.textContent = String(values.hours).padStart(2, "0");
  }
  if (parts.minutes) {
    parts.minutes.textContent = String(values.minutes).padStart(2, "0");
  }
  if (parts.seconds) {
    parts.seconds.textContent = String(values.seconds).padStart(2, "0");
  }
}

function initCartSimulation() {
  const productCards = document.querySelectorAll("[data-product-card]");
  const cartCount = document.querySelector("[data-cart-count]");
  const cartTotal = document.querySelector("[data-cart-total]");
  const ticketTotal = document.querySelector("[data-ticket-total]");
  const lastItem = document.querySelector("[data-last-item]");
  const clearButton = document.querySelector("[data-clear-cart]");

  if (!productCards.length || !cartCount || !cartTotal || !ticketTotal || !lastItem) {
    return;
  }

  let cart = loadCart();
  renderCartSummary(cart);

  productCards.forEach((card) => {
    const addButton = card.querySelector("[data-add-to-cart]");
    const sizeSelect = card.querySelector("[data-size-select]");
    const status = card.querySelector("[data-product-status]");

    if (!addButton || !sizeSelect) {
      return;
    }

    addButton.addEventListener("click", () => {
      const name = card.dataset.name || "Nevula Tee";
      const price = Number(card.dataset.price || 0);
      const tickets = Number(card.dataset.tickets || 0);
      const size = sizeSelect.value;

      const item = { name, price, tickets, size };
      cart.push(item);
      saveCart(cart);
      renderCartSummary(cart);

      if (status) {
        status.textContent = `${name} (${size}) added to your selection with ${tickets} tickets.`;
      }

      addButton.textContent = "Added";
      window.setTimeout(() => {
        addButton.textContent = "Add to Cart";
      }, 1200);
    });
  });

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      cart = [];
      saveCart(cart);
      renderCartSummary(cart);
      productCards.forEach((card) => {
        const status = card.querySelector("[data-product-status]");
        if (status) {
          status.textContent = "Select a size and add this piece to your ticket balance.";
        }
      });
    });
  }

  function renderCartSummary(items) {
    const totals = items.reduce(
      (summary, item) => {
        summary.count += 1;
        summary.price += item.price;
        summary.tickets += item.tickets;
        return summary;
      },
      { count: 0, price: 0, tickets: 0 }
    );

    cartCount.textContent = String(totals.count);
    cartTotal.textContent = `$${totals.price}`;
    ticketTotal.textContent = String(totals.tickets);

    if (items.length) {
      const latest = items[items.length - 1];
      lastItem.textContent = `${latest.name} (${latest.size})`;
    } else {
      lastItem.textContent = "No items yet";
    }
  }
}

function loadCart() {
  try {
    const savedCart = window.localStorage.getItem(STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    // Local storage may be unavailable in some browser modes.
  }
}

function initRevealOnScroll() {
  const revealItems = document.querySelectorAll("[data-reveal]");

  if (!revealItems.length) {
    return;
  }

  const revealInView = () => {
    revealItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94) {
        item.classList.add("is-visible");
      }
    });
  };

  revealInView();

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach((item) => {
    if (item.classList.contains("is-visible")) {
      return;
    }

    observer.observe(item);
  });

  window.addEventListener("load", revealInView, { once: true });
}

function initParallax() {
  const parallaxItems = document.querySelectorAll("[data-parallax]");

  if (!parallaxItems.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const updateParallax = (event) => {
    const pointerX = event.clientX / window.innerWidth - 0.5;
    const pointerY = event.clientY / window.innerHeight - 0.5;

    parallaxItems.forEach((item) => {
      const strength = Number(item.dataset.parallax || 10);
      const x = pointerX * strength;
      const y = pointerY * strength;

      item.style.setProperty("--parallax-x", `${x}px`);
      item.style.setProperty("--parallax-y", `${y}px`);
    });
  };

  window.addEventListener("pointermove", updateParallax, { passive: true });
}
