/* Bloom — approved public ownership notice (wording must remain exact) */
var BloomOwnership = (function () {
  var COPYRIGHT = '\u00A9 2026 Jullisa Campbell. All rights reserved.';
  var MARKS =
    'Bloom Technologies\u2122, Bloom Family Tech\u2122, and Bloom Academy\u2122 are marks used by Jullisa Campbell.';

  function injectStyles() {
    if (document.getElementById('bloom-ownership-styles')) return;
    var style = document.createElement('style');
    style.id = 'bloom-ownership-styles';
    style.textContent =
      '.bloom-ownership-notice{' +
      'max-width:100%;overflow-wrap:anywhere;word-wrap:break-word;hyphens:auto;' +
      '}' +
      '.bloom-ownership-notice__line{' +
      'margin:0 0 4px;line-height:1.55;' +
      '}' +
      '.bloom-ownership-notice__marks{margin-bottom:0;}' +
      '.page-footer .bloom-ownership-notice,.footer .bloom-ownership-notice{margin-top:12px;}' +
      '.footer-legal .bloom-ownership-notice{display:block;margin-bottom:8px;}';
    document.head.appendChild(style);
  }

  function noticeHtml() {
    return (
      '<div class="bloom-ownership-notice" role="contentinfo">' +
      '<p class="bloom-ownership-notice__line">' +
      COPYRIGHT +
      '</p>' +
      '<p class="bloom-ownership-notice__line bloom-ownership-notice__marks">' +
      MARKS +
      '</p>' +
      '</div>'
    );
  }

  function mountAll() {
    injectStyles();
    document.querySelectorAll('.bloom-ownership-mount').forEach(function (el) {
      el.innerHTML = noticeHtml();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }

  return {
    noticeHtml: noticeHtml,
    mountAll: mountAll,
    COPYRIGHT: COPYRIGHT,
    MARKS: MARKS,
  };
})();
