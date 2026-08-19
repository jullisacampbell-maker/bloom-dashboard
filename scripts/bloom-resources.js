/* Bloom Family Tech — resource vault rendering + filters */
var BloomResources = (function () {
  var currentFilter = "All";

  function esc(str) {
    return BloomSchool.escHtml(str);
  }

  function customerBadges(resource) {
    var badges = [];
    badges.push({ text: resource.subject, green: true });
    if (resource.bloomPick) badges.push({ text: "Bloom Pick", gold: true });
    if (resource.freeStatus === "100% Free") badges.push({ text: "100% Free" });
    else if (resource.freeStatus.indexOf("Optional Paid") >= 0) badges.push({ text: "Free + Optional Paid Extras" });
    if (resource.format === "Digital") badges.push({ text: "Digital" });
    else if (resource.format === "Printable") badges.push({ text: "Printable" });
    if (resource.independentLevel === "High") badges.push({ text: "Independent-Friendly" });
    if (resource.placement === "Family Learning") badges.push({ text: "Family Learning" });
    if (resource.placement === "Teacher Time") badges.push({ text: "Parent-Led" });
    return badges;
  }

  function renderBadge(b) {
    var cls = "badge";
    if (b.green) cls += " badge-green";
    if (b.gold) cls += " badge-gold";
    return '<span class="' + cls + '">' + esc(b.text) + "</span>";
  }

  function renderComponentsList(resource) {
    if (!resource.curriculumComponents || !resource.curriculumComponents.length) {
      return "<li>No component list available</li>";
    }
    return resource.curriculumComponents.map(function (c) {
      return "<li>" + esc(c.name) + "</li>";
    }).join("");
  }

  function formatMeta(resource) {
    if (resource.displayMeta) return resource.displayMeta;
    return resource.subject;
  }

  function renderCard(resource, compact) {
    var selected = BloomSchool.isSelected(resource.id);
    var addClass = selected ? "addlabel added" : "addlabel";
    var addText = selected ? "Added to My School" : "+ Add to My School";
    var badges = customerBadges(resource).map(renderBadge).join("");

    return (
      '<article class="resource-card' + (compact ? " resource-card--compact" : "") + '" data-cat="' + esc(resource.subject) + '" data-id="' + resource.id + '">' +
        '<div class="resource-meta">' + badges + "</div>" +
        "<h3>" + esc(resource.name) + "</h3>" +
        '<div class="provider">' + esc(resource.provider) + "</div>" +
        "<p>" + esc(resource.description) + "</p>" +
        '<div class="bestfor"><b>Best for:</b> ' + esc(resource.bestFor) + "</div>" +
        '<div class="resource-tags">' + esc(formatMeta(resource)) + "</div>" +
        '<details class="comp-details">' +
          "<summary>What comes with it</summary>" +
          '<ul class="component-list">' + renderComponentsList(resource) + "</ul>" +
        "</details>" +
        '<button type="button" class="' + addClass + '" data-add-id="' + resource.id + '" aria-pressed="' + selected + '">' + addText + "</button>" +
        '<a class="linkbtn" href="' + esc(resource.url) + '" target="_blank" rel="noopener noreferrer">Visit Resource &#8599;</a>' +
      "</article>"
    );
  }

  function bindAddButtons(container) {
    container.querySelectorAll("[data-add-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = parseInt(btn.getAttribute("data-add-id"), 10);
        var nowSelected = BloomSchool.toggleResource(id);
        btn.classList.toggle("added", nowSelected);
        btn.setAttribute("aria-pressed", nowSelected ? "true" : "false");
        btn.textContent = nowSelected ? "Added to My School" : "+ Add to My School";
        syncAllAddButtons(id, nowSelected);
      });
    });
  }

  function syncAllAddButtons(resourceId, selected) {
    document.querySelectorAll('[data-add-id="' + resourceId + '"]').forEach(function (btn) {
      btn.classList.toggle("added", selected);
      btn.setAttribute("aria-pressed", selected ? "true" : "false");
      btn.textContent = selected ? "Added to My School" : "+ Add to My School";
    });
  }

  function applyFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll(".filterbar button").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-filter") === filter);
    });
    document.querySelectorAll(".resource-card").forEach(function (card) {
      var cat = card.getAttribute("data-cat");
      var show = filter === "All" || cat === filter;
      card.classList.toggle("hidden", !show);
    });
  }

  function initFilters() {
    var bar = document.getElementById("filterBar");
    if (!bar) return;
    BLOOM_CATEGORIES.forEach(function (cat) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-filter", cat);
      var label = cat;
      if (cat === "All-in-One / Multi-Subject") label = "All-in-One";
      else if (cat === "Reading + Language Arts") label = "Reading + LA";
      btn.textContent = label;
      btn.addEventListener("click", function () { applyFilter(cat); });
      bar.appendChild(btn);
    });
    applyFilter("All");
  }

  function initCatalogToggle() {
    var toggle = document.getElementById("catalogToggle");
    var wrap = document.getElementById("catalogWrap");
    if (!toggle || !wrap) return;
    toggle.addEventListener("click", function () {
      var collapsed = wrap.classList.toggle("collapsed");
      toggle.textContent = collapsed
        ? "Browse all 36 curated resources \u2192"
        : "Hide full catalog \u2191";
    });
  }

  function renderFeatured() {
    var el = document.getElementById("featuredGrid");
    if (!el) return;
    var featured = BLOOM_RESOURCES.filter(function (r) { return r.featured; });
    el.innerHTML = featured.map(function (r) { return renderCard(r, false); }).join("");
    bindAddButtons(el);
  }

  function renderCatalog() {
    var el = document.getElementById("catalogGrid");
    if (!el) return;
    el.innerHTML = BLOOM_RESOURCES.map(function (r) { return renderCard(r, true); }).join("");
    bindAddButtons(el);
  }

  function initVaultPage() {
    renderFeatured();
    renderCatalog();
    initFilters();
    initCatalogToggle();
  }

  return {
    initVaultPage: initVaultPage,
    renderCard: renderCard,
    applyFilter: applyFilter
  };
})();
