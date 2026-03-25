document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const colorSchemeToggle = document.querySelector("[data-color-scheme-toggle]");
  const syncColorSchemeSwitch = () => {
    if (colorSchemeToggle) {
      const isDark = root.dataset.colorScheme === "dark";
      colorSchemeToggle.setAttribute("aria-checked", isDark ? "true" : "false");
    }
  };
  syncColorSchemeSwitch();
  if (colorSchemeToggle) {
    colorSchemeToggle.addEventListener("click", () => {
      const next = root.dataset.colorScheme === "dark" ? "light" : "dark";
      root.dataset.colorScheme = next;
      localStorage.setItem("nonentity-color-scheme", next);
      syncColorSchemeSwitch();
    });
  }

  const createSidebarController = ({ sidebar, toggle, backdrop, beforeOpen }) => {
    if (!sidebar || !toggle) return { close: () => {} };

    const open = () => {
      beforeOpen?.();
      sidebar.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      if (backdrop) backdrop.hidden = false;
    };

    const close = () => {
      sidebar.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      if (backdrop) backdrop.hidden = true;
    };

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      sidebar.classList.contains("is-open") ? close() : open();
    });

    backdrop?.addEventListener("click", close);

    return { close };
  };

  const sidebar = document.querySelector("[data-sidebar]");
  const toggle = document.querySelector("[data-sidebar-toggle]");
  const backdrop = document.querySelector("[data-sidebar-backdrop]");
  const rightSidebar = document.querySelector("[data-right-sidebar]");
  const rightToggle = document.querySelector("[data-right-sidebar-toggle]");
  const rightBackdrop = document.querySelector("[data-right-sidebar-backdrop]");

  const rightController = createSidebarController({
    sidebar: rightSidebar,
    toggle: rightToggle,
    backdrop: rightBackdrop,
  });

  createSidebarController({
    sidebar,
    toggle,
    backdrop,
    beforeOpen: rightController.close,
  });

  const tocContainer = document.querySelector("[data-sidebar-scroll]");
  const tocLinks = [...document.querySelectorAll("[data-toc] a")];
  const headings = tocLinks
    .map((link) => {
      const href = link.getAttribute("href");
      return href && href.startsWith("#") ? document.getElementById(decodeURIComponent(href.slice(1))) : null;
    })
    .filter(Boolean);

  if (tocContainer && tocLinks.length && headings.length) {
    let userNavigating = false;

    const scrollActiveIntoView = (activeLink) => {
      if (userNavigating) return;
      const containerRect = tocContainer.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const isAbove = linkRect.top < containerRect.top;
      const isBelow = linkRect.bottom > containerRect.bottom;
      if (isAbove || isBelow) {
        activeLink.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };

    tocLinks.forEach((link) => {
      link.addEventListener("click", () => {
        userNavigating = true;
        setTimeout(() => {
          userNavigating = false;
        }, 1000);
      });
    });

    const activate = () => {
      let current = headings[0];
      const threshold = window.innerHeight * 0.25;
      const hash = window.location.hash;
      const hashHeading = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      const hashTop = hashHeading ? hashHeading.getBoundingClientRect().top : null;

      if (hashHeading && hashTop >= 0 && hashTop <= window.innerHeight * 0.85) {
        current = hashHeading;
      } else {
        for (const heading of headings) {
          if (heading.getBoundingClientRect().top <= threshold) {
            current = heading;
          }
        }
      }

      tocLinks.forEach((link) => {
        const href = link.getAttribute("href");
        const isActive = href === `#${current.id}`;
        link.classList.toggle("active", isActive);
        if (isActive) {
          scrollActiveIntoView(link);
        }
      });
    };

    window.addEventListener("scroll", activate, { passive: true });
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(activate, 100);
    });
    activate();
  }
});
