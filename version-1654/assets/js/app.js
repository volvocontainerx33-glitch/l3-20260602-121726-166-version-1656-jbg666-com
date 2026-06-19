(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = $('.menu-toggle');
    if (!button) return;
    button.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
    $all('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
      });
    });
  }

  function setupHero() {
    var slider = $('[data-hero-slider]');
    if (!slider) return;
    var slides = $all('.hero-slide', slider);
    var dots = $all('.hero-dot');
    if (!slides.length) return;
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
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || 0));
        start();
      });
    });
    show(0);
    start();
  }

  function setupSearch() {
    var input = $('[data-local-search]');
    if (!input) return;
    var cards = $all('[data-title]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('search') || '';
    if (initial) input.value = initial;
    function apply() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden', value && haystack.indexOf(value) === -1);
      });
    }
    input.addEventListener('input', apply);
    apply();
  }

  function setupYearFilters() {
    var buttons = $all('[data-year-filter]');
    if (!buttons.length) return;
    var cards = $all('.movie-card[data-year]');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-year-filter');
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        cards.forEach(function (card) {
          card.classList.toggle('is-hidden', value !== 'all' && card.getAttribute('data-year') !== value);
        });
      });
    });
  }

  function bindPlayer(box) {
    var video = $('.movie-video', box);
    var button = $('.play-cover', box);
    var stream = box.getAttribute('data-stream');
    var ready = false;
    var hls = null;
    function prepare() {
      if (ready || !video || !stream) return;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
      ready = true;
    }
    function play() {
      prepare();
      var attempt = video.play();
      box.classList.add('is-playing');
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }
    if (button) button.addEventListener('click', play);
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) play();
      });
      video.addEventListener('pause', function () {
        box.classList.remove('is-playing');
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  }

  function setupPlayers() {
    $all('.cinema-player').forEach(bindPlayer);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupYearFilters();
    setupPlayers();
  });
})();
