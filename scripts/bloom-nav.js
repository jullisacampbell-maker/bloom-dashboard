/* Bloom Family Tech — ecosystem product navigation */
var BloomNav = (function () {
  var academyLinks = [
    { id: "academy-home", label: "Academy Home", href: "bloom-academy.html" },
    { id: "vault", label: "Free Resource Vault", href: "resource-vault.html" },
    { id: "myschool", label: "My School", href: "my-school.html" },
    { id: "setup", label: "Starter Setup", href: "starter-setup.html" },
    { id: "schedule", label: "My Schedule", href: "my-schedule.html" },
    { id: "prep", label: "Print + Prep", href: "print-prep.html" }
  ];

  var topLinks = [
    { id: "bloomhome", label: "Bloom Home", href: "index.html" },
    { id: "academy", label: "Bloom Academy", dropdown: true },
    { id: "meals", label: "Bloom Meals", href: "bloom-meals.html", soon: true },
    { id: "athletics", label: "Bloom Athletics", href: "bloom-athletics.html", soon: true },
    { id: "familyfit", label: "Bloom Family Fit", href: "bloom-family-fit.html", soon: true },
    { id: "plans", label: "Plans", href: "plans.html" },
    { id: "help", label: "Help", href: "help.html" }
  ];

  var legacyMap = {
    vault: { module: "academy", page: "vault" },
    myschool: { module: "academy", page: "myschool" },
    setup: { module: "academy", page: "setup" },
    schedule: { module: "academy", page: "schedule" },
    prep: { module: "academy", page: "prep" },
    "academy-home": { module: "academy", page: "academy-home" },
    bloomhome: { module: "bloomhome", page: "bloomhome" },
    plans: { module: "plans", page: "plans" },
    help: { module: "help", page: "help" },
    meals: { module: "meals", page: "meals" },
    athletics: { module: "athletics", page: "athletics" },
    familyfit: { module: "familyfit", page: "familyfit" },
    academy: { module: "academy", page: "academy-home" }
  };

  function normalizeInit(moduleOrOpts, page) {
    if (moduleOrOpts && typeof moduleOrOpts === "object") {
      return {
        module: moduleOrOpts.module || "",
        page: moduleOrOpts.page || moduleOrOpts.module || ""
      };
    }
    var key = moduleOrOpts || "";
    if (legacyMap[key]) return legacyMap[key];
    return { module: key, page: page || key };
  }

  function cls(active, id, base) {
    return active === id ? base + " is-active" : base;
  }

  function renderAcademyLinks(page, mobile) {
    var prefix = mobile ? "eco-mobile-sub" : "eco-dropdown-link";
    return academyLinks.map(function (link) {
      return (
        '<a href="' + link.href + '" class="' + cls(page, link.id, prefix) + '">' +
        link.label +
        "</a>"
      );
    }).join("");
  }

  function renderDesktopNav(module, page) {
    return topLinks.map(function (item) {
      if (item.dropdown) {
        return (
          '<div class="eco-dropdown' + (module === "academy" ? " is-active" : "") + '">' +
          '<button type="button" class="eco-link eco-dropdown-trigger" aria-expanded="false" aria-haspopup="true">' +
          item.label +
          ' <span class="eco-caret" aria-hidden="true">▾</span></button>' +
          '<div class="eco-dropdown-menu" role="menu">' +
          '<div class="eco-dropdown-head">' +
          "<strong>Bloom Academy</strong>" +
          "<span>Learning organized around your family.</span>" +
          "</div>" +
          renderAcademyLinks(page, false) +
          "</div></div>"
        );
      }
      var soon = item.soon ? '<span class="eco-soon-pill">Coming Soon</span>' : "";
      return (
        '<a href="' + item.href + '" class="' + cls(module, item.id, "eco-link") + '">' +
        item.label + soon +
        "</a>"
      );
    }).join("");
  }

  function renderMobileNav(module, page) {
    var html = topLinks.map(function (item) {
      if (item.dropdown) {
        return (
          '<div class="eco-mobile-group' + (module === "academy" ? " is-active" : "") + '">' +
          '<button type="button" class="eco-mobile-group-trigger" aria-expanded="false">' +
          item.label + ' <span aria-hidden="true">▾</span></button>' +
          '<div class="eco-mobile-sublist">' +
          renderAcademyLinks(page, true) +
          "</div></div>"
        );
      }
      var soon = item.soon ? ' <span class="eco-soon-pill">Coming Soon</span>' : "";
      return (
        '<a href="' + item.href + '" class="' + cls(module, item.id, "eco-mobile-link") + '">' +
        item.label + soon +
        "</a>"
      );
    }).join("");
    return html;
  }

  function bindNav(root) {
    var toggle = root.querySelector(".eco-menu-toggle");
    var panel = root.querySelector(".eco-nav-panel");
    var dropdowns = root.querySelectorAll(".eco-dropdown");
    var mobileGroups = root.querySelectorAll(".eco-mobile-group");
    var themeBtn = root.querySelector(".eco-theme-btn");

    function closeAllDropdowns() {
      dropdowns.forEach(function (dd) {
        dd.classList.remove("is-open");
        var btn = dd.querySelector(".eco-dropdown-trigger");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    }

  if (toggle && panel) {
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = root.classList.toggle("eco-nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        if (!open) closeAllDropdowns();
      });
    }

    dropdowns.forEach(function (dd) {
      var btn = dd.querySelector(".eco-dropdown-trigger");
      if (!btn) return;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var wasOpen = dd.classList.contains("is-open");
        closeAllDropdowns();
        if (!wasOpen) {
          dd.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
      dd.addEventListener("mouseenter", function () {
        if (window.matchMedia("(min-width: 901px)").matches) {
          closeAllDropdowns();
          dd.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
      dd.addEventListener("mouseleave", function () {
        if (window.matchMedia("(min-width: 901px)").matches) {
          dd.classList.remove("is-open");
          btn.setAttribute("aria-expanded", "false");
        }
      });
    });

    mobileGroups.forEach(function (group) {
      var btn = group.querySelector(".eco-mobile-group-trigger");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var open = group.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    document.addEventListener("click", function (e) {
      if (!root.contains(e.target)) {
        closeAllDropdowns();
        root.classList.remove("eco-nav-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAllDropdowns();
        root.classList.remove("eco-nav-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    });

    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        if (typeof window.toggleDarkMode === "function") {
          window.toggleDarkMode();
        }
      });
    }
  }

  function render(module, page, showTheme) {
    var mount = document.getElementById("bloom-eco-nav");
    if (!mount) return;

    var themeHtml = showTheme
      ? '<button type="button" class="eco-theme-btn" title="Toggle appearance" aria-label="Toggle appearance">🌙</button>'
      : "";

    mount.innerHTML =
      '<header class="eco-nav" role="banner">' +
      '<div class="eco-nav-inner">' +
      '<a class="eco-brand" href="resource-vault.html">' +
      '<span class="eco-brand-mark" aria-hidden="true">🌿</span>' +
      '<span class="eco-brand-name">Bloom Family Tech</span></a>' +
      '<button type="button" class="eco-menu-toggle" aria-expanded="false" aria-controls="eco-nav-panel" aria-label="Open menu">' +
      '<span class="eco-menu-icon" aria-hidden="true"></span></button>' +
      '<div class="eco-nav-panel" id="eco-nav-panel">' +
      '<nav class="eco-nav-desktop" aria-label="Bloom Family Tech">' +
      renderDesktopNav(module, page) +
      "</nav>" +
      '<nav class="eco-nav-mobile" aria-label="Bloom Family Tech mobile">' +
      renderMobileNav(module, page) +
      "</nav>" +
      '<div class="eco-nav-utils">' + themeHtml + "</div>" +
      "</div></div></header>";

    bindNav(mount);
    document.documentElement.style.setProperty("--eco-nav-h", "56px");
  }

  function init(moduleOrOpts, page) {
    var state = normalizeInit(moduleOrOpts, page);
    var showTheme = typeof window.toggleDarkMode === "function";
    render(state.module, state.page, showTheme);
  }

  return { init: init, academyLinks: academyLinks, topLinks: topLinks };
})();
