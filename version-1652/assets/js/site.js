(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  ready(function () {
    var header = document.querySelector("[data-header]");
    var menuButton = document.querySelector("[data-menu-toggle]");

    function updateHeader() {
      if (!header) {
        return;
      }

      if (window.scrollY > 18) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menuButton && header) {
      menuButton.addEventListener("click", function () {
        header.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      var input = form.querySelector("input[name='q']");
      var panel = form.querySelector("[data-search-panel]");
      var indexData = typeof MOVIE_SEARCH_INDEX !== "undefined" ? MOVIE_SEARCH_INDEX : [];

      if (!input || !panel || !indexData.length) {
        return;
      }

      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();

        if (!query) {
          panel.classList.remove("is-visible");
          panel.innerHTML = "";
          return;
        }

        var results = indexData.filter(function (item) {
          return item.text.indexOf(query) !== -1;
        }).slice(0, 8);

        if (!results.length) {
          panel.classList.remove("is-visible");
          panel.innerHTML = "";
          return;
        }

        panel.innerHTML = results.map(function (item) {
          return "<a href=\"" + escapeHtml(item.url) + "\"><strong>" + escapeHtml(item.title) + "</strong><small>" + escapeHtml(item.meta) + "</small></a>";
        }).join("");
        panel.classList.add("is-visible");
      });

      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("is-visible");
        }
      });
    });

    document.querySelectorAll("[data-listing]").forEach(function (listing) {
      var input = listing.querySelector("[data-card-filter]");
      var chips = Array.prototype.slice.call(listing.querySelectorAll("[data-filter-value]"));
      var cards = Array.prototype.slice.call(listing.querySelectorAll("[data-search]"));
      var empty = listing.querySelector("[data-empty-state]");
      var activeValue = "all";

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilter() {
        var query = normalize(input ? input.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesChip = activeValue === "all" || text.indexOf(normalize(activeValue)) !== -1;
          var shouldShow = matchesQuery && matchesChip;
          card.style.display = shouldShow ? "" : "none";

          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (listing.hasAttribute("data-query-listing") && input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");

        if (q) {
          input.value = q;
        }
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("active");
          });
          chip.classList.add("active");
          activeValue = chip.getAttribute("data-filter-value") || "all";
          applyFilter();
        });
      });

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      applyFilter();
    });
  });
}());
