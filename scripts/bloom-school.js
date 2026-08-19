/* Bloom Family Tech — My School storage (namespaced, read-only Bloom OS integration) */
var BloomSchool = (function () {
  var KEYS = {
    selections: "bft_my_school_selections",
    learners: "bft_school_learners",
    starterSetup: "bft_starter_setup",
    prepState: "bft_prep_item_state"
  };

  var OS_CHILDREN_KEY = "bloom_children";
  var OS_NAME_KEY = "bloom_name";

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getResourceById(id) {
    if (typeof BLOOM_RESOURCES === "undefined") return null;
    return BLOOM_RESOURCES.find(function (r) { return r.id === id; }) || null;
  }

  function getSelections() {
    return readJSON(KEYS.selections, []);
  }

  function saveSelections(list) {
    writeJSON(KEYS.selections, list);
  }

  function isSelected(resourceId) {
    return getSelections().some(function (s) { return s.resourceId === resourceId; });
  }

  function addResource(resourceId, options) {
    options = options || {};
    var list = getSelections();
    if (list.some(function (s) { return s.resourceId === resourceId; })) {
      return false;
    }
    var resource = getResourceById(resourceId);
    if (!resource) return false;
    var learners = getLearners();
    var learnerId = options.learnerId || (learners[0] ? learners[0].id : "default");
    list.push({
      resourceId: resourceId,
      learnerId: learnerId,
      placement: options.placement || resource.placement || "Teacher Time",
      frequency: options.frequency || resource.frequency || "As scheduled",
      addedAt: Date.now()
    });
    saveSelections(list);
    return true;
  }

  function removeResource(resourceId) {
    var list = getSelections().filter(function (s) { return s.resourceId !== resourceId; });
    saveSelections(list);
    removePrepStateForResource(resourceId);
  }

  function toggleResource(resourceId) {
    if (isSelected(resourceId)) {
      removeResource(resourceId);
      return false;
    }
    addResource(resourceId);
    return true;
  }

  function getLearners() {
    var custom = readJSON(KEYS.learners, null);
    if (custom && custom.length) return custom;

    var osChildren = readJSON(OS_CHILDREN_KEY, []);
    if (osChildren && osChildren.length) {
      return osChildren.map(function (child, idx) {
        return {
          id: "os_child_" + idx,
          name: child.name || ("Child " + (idx + 1)),
          grade: inferGrade(child),
          source: "bloom_os"
        };
      });
    }

    var parentName = localStorage.getItem(OS_NAME_KEY);
    var learnerName = parentName ? parentName + "'s learner" : "My Learner";
    return [{
      id: "default",
      name: learnerName,
      grade: "Kindergarten",
      source: "default"
    }];
  }

  function inferGrade(child) {
    if (child.notes && /grade|kindergarten|preschool/i.test(child.notes)) {
      var m = child.notes.match(/(Preschool|Kindergarten|\d+(st|nd|rd|th) Grade)/i);
      if (m) return m[0];
    }
    return "Kindergarten";
  }

  function saveLearners(learners) {
    writeJSON(KEYS.learners, learners);
  }

  function getStarterSetup() {
    return readJSON(KEYS.starterSetup, {
      learnerName: getLearners()[0] ? getLearners()[0].name : "",
      grade: "Kindergarten",
      schoolDays: "5",
      dailyTime: "90"
    });
  }

  function saveStarterSetup(data) {
    writeJSON(KEYS.starterSetup, data);
  }

  function normalizePrepEntry(val) {
    if (!val) return { status: "To Do", location: null };
    if (typeof val === "string") return { status: val, location: null };
    return {
      status: val.status || "To Do",
      location: val.location || null
    };
  }

  function getPrepState() {
    return readJSON(KEYS.prepState, {});
  }

  function getPrepItem(key) {
    return normalizePrepEntry(getPrepState()[key]);
  }

  function setPrepItemState(key, state) {
    var all = getPrepState();
    var entry = normalizePrepEntry(all[key]);
    entry.status = state;
    all[key] = entry;
    writeJSON(KEYS.prepState, all);
  }

  function setPrepItemLocation(key, location) {
    var all = getPrepState();
    var entry = normalizePrepEntry(all[key]);
    entry.location = location || null;
    all[key] = entry;
    writeJSON(KEYS.prepState, all);
  }

  function removePrepStateForResource(resourceId) {
    var all = getPrepState();
    var prefix = "r" + resourceId + "_";
    Object.keys(all).forEach(function (k) {
      if (k.indexOf(prefix) === 0) delete all[k];
    });
    writeJSON(KEYS.prepState, all);
  }

  function groupSelectionsByLearner() {
    var selections = getSelections();
    var learners = getLearners();
    var groups = {};

    learners.forEach(function (l) {
      groups[l.id] = {
        learner: l,
        placements: {
          "Teacher Time": [],
          "Independent": [],
          "Family Learning": [],
          "Bloom Basket": [],
          "Family / Shared": []
        }
      };
    });

    selections.forEach(function (sel) {
      var resource = getResourceById(sel.resourceId);
      if (!resource) return;
      var learnerId = sel.learnerId;
      if (!groups[learnerId]) {
        groups[learnerId] = {
          learner: { id: learnerId, name: "Learner", grade: "" },
          placements: {
            "Teacher Time": [],
            "Independent": [],
            "Family Learning": [],
            "Bloom Basket": [],
            "Family / Shared": []
          }
        };
      }
      var placement = sel.placement || resource.placement || "Teacher Time";
      if (!groups[learnerId].placements[placement]) {
        placement = "Teacher Time";
      }
      groups[learnerId].placements[placement].push({ selection: sel, resource: resource });
    });

    return groups;
  }

  function escHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return {
    KEYS: KEYS,
    getSelections: getSelections,
    isSelected: isSelected,
    addResource: addResource,
    removeResource: removeResource,
    toggleResource: toggleResource,
    getLearners: getLearners,
    saveLearners: saveLearners,
    getStarterSetup: getStarterSetup,
    saveStarterSetup: saveStarterSetup,
    getPrepState: getPrepState,
    getPrepItem: getPrepItem,
    setPrepItemState: setPrepItemState,
    setPrepItemLocation: setPrepItemLocation,
    groupSelectionsByLearner: groupSelectionsByLearner,
    getResourceById: getResourceById,
    escHtml: escHtml
  };
})();
