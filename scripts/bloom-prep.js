/* Bloom Family Tech — Print + Prep + My School rendering */
var BloomPrep = (function () {
  var BUCKET_LABELS = {
    parent: "For the Parent",
    learner: "For the Learner",
    family: "Family / Shared",
    supplies: "Supplies"
  };

  var ALL_STATES = ["To Do", "Printed", "Gathered", "Ready"];
  var DIGITAL_STATES = ["To Do", "Ready"];
  var SUPPLY_STATES = ["To Do", "Gathered", "Ready"];
  var LOCATION_OPTIONS = ["", "Digital", "Binder", "Bookshelf", "Bloom Basket", "Other"];

  function esc(str) {
    return BloomSchool.escHtml(str);
  }

  function prepActionText(comp) {
    if (comp.prepAction) return comp.prepAction;
    var bucket = comp.prepBucket || "parent";
    if (bucket === "digital") return "Open online";
    if (bucket === "learner") return "Print / gather";
    if (bucket === "family") return "Review / choose";
    if (bucket === "supplies") return "Gather materials";
    return "Review / print";
  }

  function isDigitalItem(comp, resource) {
    if (comp.prepBucket === "digital") return true;
    if (resource && resource.format === "Digital") {
      return /resource|lesson access|usage note|digital|video/i.test(comp.name);
    }
    return false;
  }

  function availableStates(item) {
    if (item.bucket === "supplies") return SUPPLY_STATES;
    if (item.isDigital) return DIGITAL_STATES;
    return ALL_STATES;
  }

  function resolveLocation(item, prepEntry) {
    if (prepEntry.location) return prepEntry.location;
    if (item.isDigital) return "Digital";
    return null;
  }

  function buildPrepItems() {
    var selections = BloomSchool.getSelections();
    var buckets = {
      parent: [],
      learner: [],
      family: [],
      supplies: []
    };

    selections.forEach(function (sel) {
      var resource = BloomSchool.getResourceById(sel.resourceId);
      if (!resource || !resource.curriculumComponents) return;

      resource.curriculumComponents.forEach(function (comp, idx) {
        var bucket = comp.prepBucket || "parent";
        if (bucket === "digital") return;
        if (!buckets[bucket]) bucket = "parent";
        buckets[bucket].push({
          key: "r" + resource.id + "_c" + idx,
          resourceId: resource.id,
          resourceName: resource.name,
          resourceUrl: resource.url,
          componentName: comp.name,
          action: prepActionText(comp),
          bucket: bucket,
          isDigital: isDigitalItem(comp, resource)
        });
      });
    });

    return buckets;
  }

  function renderStateButtons(item, currentState) {
    var states = availableStates(item);
    return states.map(function (state) {
      var cls = "prep-state-btn" + (state === currentState ? " is-active" : "");
      return (
        '<button type="button" class="' + cls + '" data-prep-key="' + esc(item.key) + '" data-prep-state="' + esc(state) + '" aria-pressed="' + (state === currentState) + '">' +
        esc(state) + "</button>"
      );
    }).join("");
  }

  function renderLocationSelect(item, prepEntry) {
    var loc = resolveLocation(item, prepEntry);
    var html = '<label class="prep-location-label">Location<select class="prep-location-select" data-prep-loc-key="' + esc(item.key) + '">';
    LOCATION_OPTIONS.forEach(function (opt) {
      var label = opt || "Location not set";
      var val = opt;
      var selected = (loc === opt || (!loc && !opt)) ? " selected" : "";
      html += '<option value="' + esc(val) + '"' + selected + ">" + esc(label) + "</option>";
    });
    html += "</select></label>";
    return html;
  }

  function renderWhereLine(item, prepEntry) {
    var loc = resolveLocation(item, prepEntry);
    var locLabel = loc || "Location not set";
    var line = esc(item.action) + " \u2022 " + esc(locLabel);
    if (item.isDigital && item.resourceUrl) {
      line += ' \u2022 <a class="prep-link" href="' + esc(item.resourceUrl) + '" target="_blank" rel="noopener noreferrer">Open Resource &#8599;</a>';
    }
    return line;
  }

  function bindPrepInteractions(container) {
    container.querySelectorAll(".prep-state-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-prep-key");
        var state = btn.getAttribute("data-prep-state");
        BloomSchool.setPrepItemState(key, state);
        var row = btn.closest(".checkline");
        if (row) {
          row.querySelectorAll(".prep-state-btn").forEach(function (b) {
            var active = b.getAttribute("data-prep-state") === state;
            b.classList.toggle("is-active", active);
            b.setAttribute("aria-pressed", active ? "true" : "false");
          });
        }
      });
    });

    container.querySelectorAll(".prep-location-select").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var key = sel.getAttribute("data-prep-loc-key");
        var val = sel.value || null;
        BloomSchool.setPrepItemLocation(key, val);
      });
    });
  }

  function renderPrepPage() {
    var container = document.getElementById("prepContainer");
    if (!container) return;

    var selections = BloomSchool.getSelections();
    if (!selections.length) {
      container.innerHTML =
        '<div class="empty-state">' +
          "<h3>Nothing to prep yet</h3>" +
          "<p>Add resources to My School first, then return here to see what to print, gather, and review.</p>" +
          '<div class="actions" style="justify-content:center">' +
            '<a class="btn btn-primary" href="resource-vault.html">Explore Free Resources</a>' +
            '<a class="btn btn-secondary" href="my-school.html">Go to My School</a>' +
          "</div></div>";
      return;
    }

    var buckets = buildPrepItems();
    var html = '<div class="prepqueue prepqueue-full">';

    ["parent", "learner", "family", "supplies"].forEach(function (bucketKey) {
      var items = buckets[bucketKey];
      if (!items.length) return;

      html += '<div class="queuecard"><h3>' + BUCKET_LABELS[bucketKey] + "</h3>";

      var byResource = {};
      items.forEach(function (item) {
        if (!byResource[item.resourceId]) {
          byResource[item.resourceId] = { name: item.resourceName, items: [] };
        }
        byResource[item.resourceId].items.push(item);
      });

      Object.keys(byResource).forEach(function (rid) {
        var group = byResource[rid];
        html += '<div class="resource-prep-group"><h4>' + esc(group.name) + "</h4>";
        group.items.forEach(function (item) {
          var prepEntry = BloomSchool.getPrepItem(item.key);
          var state = prepEntry.status || "To Do";
          html +=
            '<div class="checkline">' +
              '<span class="box" aria-hidden="true"></span>' +
              "<div><b>" + esc(item.componentName) + "</b>" +
              '<div class="where">' + renderWhereLine(item, prepEntry) + "</div>" +
              '<div class="prep-states">' + renderStateButtons(item, state) + "</div>" +
              renderLocationSelect(item, prepEntry) +
              "</div></div>";
        });
        html += "</div>";
      });

      html += "</div>";
    });

    html += "</div>";
    container.innerHTML = html;
    bindPrepInteractions(container);
  }

  function renderMySchoolPage() {
    var mainEl = document.getElementById("schoolMain");
    var sideEl = document.getElementById("schoolSide");
    if (!mainEl) return;

    var selections = BloomSchool.getSelections();
    var groups = BloomSchool.groupSelectionsByLearner();
    var learnerIds = Object.keys(groups);

    if (!selections.length) {
      mainEl.innerHTML =
        '<div class="empty-state">' +
          "<h3>Your school shelf is empty</h3>" +
          "<p>Browse the Free Resource Vault and add curriculum that fits your learner. Bloom will organize the teaching materials alongside each resource.</p>" +
          '<div class="actions" style="justify-content:center">' +
            '<a class="btn btn-primary" href="resource-vault.html">Explore Free Resources</a>' +
          "</div></div>";
      if (sideEl) sideEl.innerHTML = renderComponentsSidebar();
      return;
    }

    var html = "";
    learnerIds.forEach(function (lid) {
      var group = groups[lid];
      var learner = group.learner;
      var count = selections.filter(function (s) { return s.learnerId === lid; }).length;
      var gradeLabel = learner.grade ? " \u2014 " + esc(learner.grade) : "";

      html += '<div class="learnercard">';
      html += '<div class="learnerhead"><div><h3>' + esc(learner.name) + gradeLabel + "</h3>";
      html += '<div class="provider">Your homeschool shelf</div></div>';
      html += '<span class="pill">' + count + " resource" + (count === 1 ? "" : "s") + "</span></div>";

      var placementOrder = ["Teacher Time", "Independent", "Family Learning", "Bloom Basket", "Family / Shared"];
      placementOrder.forEach(function (placement) {
        var items = group.placements[placement];
        if (!items || !items.length) return;
        html += '<div class="placement-group"><div class="placement-label">' + esc(placement) + "</div>";
        items.forEach(function (entry) {
          var r = entry.resource;
          var sel = entry.selection;
          var comps = r.curriculumComponents || [];
          var parentFirst = comps.slice().sort(function (a, b) {
            var ap = /parent|teacher|guide|lesson plan/i.test(a.name) ? 0 : 1;
            var bp = /parent|teacher|guide|lesson plan/i.test(b.name) ? 0 : 1;
            return ap - bp;
          });
          var chips = parentFirst.slice(0, 5).map(function (c) {
            return "<i>" + esc(c.name) + "</i>";
          }).join("");
          html +=
            '<div class="curriculumrow">' +
              "<div><b>" + esc(r.name) + "</b><span>" + esc(r.subject) + " \u2022 " + esc(sel.frequency || r.frequency) + "</span></div>" +
              '<div class="componentchips">' + chips + "</div>" +
              '<button type="button" class="btn btn-secondary btn-sm" data-remove-id="' + r.id + '">Remove</button>' +
            "</div>";
        });
        html += "</div>";
      });

      html +=
        '<div class="actions">' +
          '<a class="btn btn-primary" href="starter-setup.html">Build My Week \u2192</a>' +
          '<a class="btn btn-secondary" href="resource-vault.html">Add More Resources</a>' +
          '<a class="btn btn-secondary" href="print-prep.html">Print + Prep</a>' +
        "</div></div>";
    });

    mainEl.innerHTML = html;
    if (sideEl) sideEl.innerHTML = renderComponentsSidebar();

    mainEl.querySelectorAll("[data-remove-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = parseInt(btn.getAttribute("data-remove-id"), 10);
        BloomSchool.removeResource(id);
        renderMySchoolPage();
      });
    });
  }

  function renderComponentsSidebar() {
    return (
      '<div class="prepmini">' +
        '<div class="eyebrow" style="color:#acd0b6">CURRICULUM COMPONENTS</div>' +
        "<h3>Bloom knows the parent has materials too.</h3>" +
        "<p>When a curriculum includes teaching support, Bloom treats it as part of the school\u2014not as a hidden download the parent has to remember later.</p>" +
        "<ul><li>Parent / teacher guide</li><li>Student pages or workbooks</li><li>Answer keys</li><li>Readers and read-alouds</li><li>Supplies and prep notes</li></ul>" +
        '<a class="btn" style="background:white;color:var(--navy)" href="print-prep.html">See Print + Prep \u2192</a>' +
      "</div>"
    );
  }

  function initStarterSetupForm() {
    var form = document.getElementById("starterSetupForm");
    if (!form) return;
    var data = BloomSchool.getStarterSetup();
    var learners = BloomSchool.getLearners();
    if (data.learnerName) form.learnerName.value = data.learnerName;
    else if (learners[0]) form.learnerName.value = learners[0].name;
    form.grade.value = data.grade || "Kindergarten";
    form.schoolDays.value = data.schoolDays || "5";
    form.dailyTime.value = data.dailyTime || "90";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      BloomSchool.saveStarterSetup({
        learnerName: form.learnerName.value.trim(),
        grade: form.grade.value,
        schoolDays: form.schoolDays.value,
        dailyTime: form.dailyTime.value
      });
      window.location.href = "my-schedule.html";
    });
  }

  return {
    renderPrepPage: renderPrepPage,
    renderMySchoolPage: renderMySchoolPage,
    initStarterSetupForm: initStarterSetupForm,
    buildPrepItems: buildPrepItems
  };
})();
