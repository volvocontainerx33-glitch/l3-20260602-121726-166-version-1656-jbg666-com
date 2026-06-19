(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navPanel = document.querySelector('[data-nav-panel]');

  if (navToggle && navPanel) {
    navToggle.addEventListener('click', function () {
      navPanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  document.querySelectorAll('[data-global-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="search"]');
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = './movies.html?search=' + encodeURIComponent(input.value.trim());
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function activate(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.closest('section') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var searchInput = panel.querySelector('[data-filter-search]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var count = panel.querySelector('[data-filter-count]');
    var params = new URLSearchParams(window.location.search);
    var incomingSearch = params.get('search');

    if (searchInput && incomingSearch) {
      searchInput.value = incomingSearch;
    }

    function yearMatches(cardYear, filterYear) {
      var year = parseInt(cardYear, 10);
      if (!filterYear) {
        return true;
      }
      if (filterYear === '2010s') {
        return year >= 2010 && year <= 2019;
      }
      if (filterYear === '2000s') {
        return year >= 2000 && year <= 2009;
      }
      if (filterYear === 'older') {
        return year < 2000;
      }
      return String(cardYear) === filterYear;
    }

    function applyFilters() {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.dataset.search || '').toLowerCase();
        var isVisible = true;

        if (q && text.indexOf(q) === -1) {
          isVisible = false;
        }
        if (type && card.dataset.type !== type) {
          isVisible = false;
        }
        if (!yearMatches(card.dataset.year || '', year)) {
          isVisible = false;
        }
        if (category && card.dataset.category !== category) {
          isVisible = false;
        }

        card.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [searchInput, typeSelect, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });
})();
