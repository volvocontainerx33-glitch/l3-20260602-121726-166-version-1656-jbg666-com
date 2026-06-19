(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-menu-button]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupCarousel() {
    var root = qs('[data-carousel]');
    if (!root) return;
    var slides = qsa('.hero-slide', root);
    var dots = qsa('.hero-dot', root);
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (timer) window.clearInterval(timer);
        show(i);
        play();
      });
    });

    if (slides.length > 1) play();
  }

  function setupFilters() {
    var lists = qsa('[data-filter-list]');
    if (!lists.length) return;
    lists.forEach(function (list) {
      var scopeName = list.getAttribute('data-filter-list');
      var search = qs('[data-filter-search="' + scopeName + '"]');
      var year = qs('[data-filter-year="' + scopeName + '"]');
      var type = qs('[data-filter-type="' + scopeName + '"]');
      var cards = qsa('[data-movie-card]', list);

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var ok = true;
          if (keyword && text.indexOf(keyword) === -1) ok = false;
          if (yearValue && cardYear !== yearValue) ok = false;
          if (typeValue && cardType !== typeValue) ok = false;
          card.classList.toggle('hidden-by-filter', !ok);
        });
      }

      [search, year, type].forEach(function (control) {
        if (control) control.addEventListener('input', apply);
        if (control) control.addEventListener('change', apply);
      });
    });
  }

  function setupPlayer() {
    var shell = qs('[data-player-shell]');
    if (!shell) return;
    var video = qs('video[data-src]', shell);
    var button = qs('.js-play', shell);
    if (!video || !button) return;

    function loadAndPlay() {
      var src = video.getAttribute('data-src');
      if (!src) return;
      if (!video.getAttribute('data-loaded')) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          window.currentMovieHls = hls;
        } else {
          video.src = src;
        }
        video.setAttribute('data-loaded', '1');
      }
      button.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    button.addEventListener('click', loadAndPlay);
    video.addEventListener('click', function () {
      if (video.paused) loadAndPlay();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupCarousel();
    setupFilters();
    setupPlayer();
  });
})();
