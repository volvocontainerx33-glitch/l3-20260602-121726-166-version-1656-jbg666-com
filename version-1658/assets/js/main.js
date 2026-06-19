(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === active);
      });
    }

    function go(step) {
      show(active + step);
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        go(1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        go(1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        go(-1);
        start();
      });
    }

    show(0);
    start();
  }

  function initLocalFilter() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var scopeSelector = input.getAttribute("data-filter-scope");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region")
          ].join(" ").toLowerCase();
          card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
        });
      });
    });
  }

  function movieCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card medium\" data-movie-card>" +
      "<a class=\"poster-link\" href=\"./" + item.file + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
      "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"score-badge\">" + item.score + "</span>" +
      "<span class=\"play-badge\">▶</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta\"><span>" + item.year + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
      "<h3><a href=\"./" + item.file + "\">" + escapeHtml(item.title) + "</a></h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initSearchPage() {
    var input = document.querySelector("[data-site-search]");
    var results = document.querySelector("[data-site-search-results]");
    if (!input || !results || !Array.isArray(window.MovieSearchData)) {
      return;
    }

    function render(query) {
      var text = query.trim().toLowerCase();
      var items = window.MovieSearchData.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(" "), item.oneLine].join(" ").toLowerCase();
        return !text || haystack.indexOf(text) !== -1;
      }).slice(0, 80);

      if (!items.length) {
        results.innerHTML = "<div class=\"no-results\">暂未找到匹配影片，可以尝试更换片名、地区、年份或类型关键词。</div>";
        return;
      }

      results.innerHTML = items.map(movieCard).join("");
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    render(initial);

    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
  });
})();
