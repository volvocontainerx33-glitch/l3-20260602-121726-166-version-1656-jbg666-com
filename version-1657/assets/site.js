(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var navToggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (navToggle && mobileNav) {
            navToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            }

            function start() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            show(0);
            start();
        }

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var section = panel.closest("section") || document;
            var list = section.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var searchInput = panel.querySelector("[data-search-input]");
            var yearFilter = panel.querySelector("[data-year-filter]");
            var typeFilter = panel.querySelector("[data-type-filter]");

            function value(node) {
                return node ? node.value.trim().toLowerCase() : "";
            }

            function applyFilter() {
                var query = value(searchInput);
                var year = value(yearFilter);
                var type = value(typeFilter);
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type")
                    ].join(" ").toLowerCase();
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesYear = !year || String(card.getAttribute("data-year") || "").toLowerCase() === year;
                    var matchesType = !type || String(card.getAttribute("data-type") || "").toLowerCase().indexOf(type) !== -1;
                    card.classList.toggle("hidden-card", !(matchesQuery && matchesYear && matchesType));
                });
            }

            [searchInput, yearFilter, typeFilter].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
        });
    });
})();
