function setupMobileMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener('click', function() {
    nav.classList.toggle('is-open');
  });
}

function setupHeroSlider() {
  var slider = document.querySelector('[data-hero-slider]');
  if (!slider) {
    return;
  }
  var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
  var prev = slider.querySelector('[data-hero-prev]');
  var next = slider.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prev) {
    prev.addEventListener('click', function() {
      show(index - 1);
      start();
    });
  }
  if (next) {
    next.addEventListener('click', function() {
      show(index + 1);
      start();
    });
  }
  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      start();
    });
  });
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupCatalogFilters() {
  var tools = document.querySelector('[data-catalog-tools]');
  var grid = document.querySelector('[data-card-grid]');
  if (!tools || !grid) {
    return;
  }
  var searchInput = tools.querySelector('[data-filter-search]');
  var yearSelect = tools.querySelector('[data-filter-year]');
  var typeSelect = tools.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
  var years = [];
  var types = [];

  cards.forEach(function(card) {
    var year = card.getAttribute('data-year') || '';
    var type = card.getAttribute('data-type') || '';
    if (year && years.indexOf(year) === -1) {
      years.push(year);
    }
    if (type && types.indexOf(type) === -1) {
      types.push(type);
    }
  });

  years.sort(function(a, b) {
    return Number(b) - Number(a);
  });
  types.sort();

  if (yearSelect) {
    years.forEach(function(year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });
  }

  if (typeSelect) {
    types.forEach(function(type) {
      var option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  if (query && searchInput) {
    searchInput.value = query;
  }

  function applyFilters() {
    var text = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    cards.forEach(function(card) {
      var searchText = (card.getAttribute('data-search-text') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var cardType = card.getAttribute('data-type') || '';
      var visible = true;
      if (text && searchText.indexOf(text) === -1) {
        visible = false;
      }
      if (year && cardYear !== year) {
        visible = false;
      }
      if (type && cardType !== type) {
        visible = false;
      }
      card.hidden = !visible;
    });
  }

  [searchInput, yearSelect, typeSelect].forEach(function(control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });
  applyFilters();
}

function initMoviePlayer(sourceUrl) {
  var shell = document.querySelector('[data-player]');
  if (!shell) {
    return;
  }
  var video = shell.querySelector('video');
  var overlay = shell.querySelector('.player-overlay');
  var loaded = false;
  var hls = null;

  function loadSource() {
    if (loaded || !video) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
    loaded = true;
  }

  function playVideo() {
    loadSource();
    shell.classList.add('is-playing');
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }
  if (video) {
    video.addEventListener('click', function() {
      if (video.paused) {
        playVideo();
      }
    });
  }
  window.addEventListener('beforeunload', function() {
    if (hls) {
      hls.destroy();
    }
  });
}

window.initMoviePlayer = initMoviePlayer;

document.addEventListener('DOMContentLoaded', function() {
  setupMobileMenu();
  setupHeroSlider();
  setupCatalogFilters();
});
