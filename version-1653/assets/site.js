(function () {
  var mobileButton = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      mobileButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var sliders = document.querySelectorAll(".hero-slider");

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    showSlide(0);
    restart();
  });

  var panels = document.querySelectorAll("[data-filter-panel]");

  panels.forEach(function (panel) {
    var input = panel.querySelector("[data-filter-input]");
    var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
    var cards = Array.prototype.slice.call(panel.querySelectorAll(".movie-card"));
    var empty = panel.querySelector(".no-results");

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var active = {};

      selects.forEach(function (select) {
        if (select.value) {
          active[select.getAttribute("data-filter-select")] = select.value;
        }
      });

      var visible = 0;

      cards.forEach(function (card) {
        var searchText = (card.getAttribute("data-search") || "").toLowerCase();
        var matched = !keyword || searchText.indexOf(keyword) !== -1;

        Object.keys(active).forEach(function (key) {
          if (key === "year" && card.getAttribute("data-year") !== active[key]) {
            matched = false;
          }

          if (key === "type" && card.getAttribute("data-type") !== active[key]) {
            matched = false;
          }
        });

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", applyFilter);
    });
  });
})();
