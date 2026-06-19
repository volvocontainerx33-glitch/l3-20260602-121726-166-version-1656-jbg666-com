(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero]");
        if (!slider) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", slider);
        var dots = selectAll("[data-hero-dot]", slider);
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function setupRails() {
        selectAll("[data-scroll-target]").forEach(function (button) {
            button.addEventListener("click", function () {
                var target = document.getElementById(button.getAttribute("data-scroll-target"));
                var direction = button.getAttribute("data-scroll-direction") === "left" ? -1 : 1;
                if (target) {
                    target.scrollBy({ left: direction * 420, behavior: "smooth" });
                }
            });
        });
    }

    function setupTabs() {
        selectAll("[data-tab-group]").forEach(function (group) {
            var buttons = selectAll("[data-tab-button]", group);
            var panels = selectAll("[data-tab-panel]", group);
            function activate(name) {
                buttons.forEach(function (button) {
                    button.classList.toggle("is-active", button.getAttribute("data-tab-button") === name);
                });
                panels.forEach(function (panel) {
                    panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === name);
                });
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activate(button.getAttribute("data-tab-button"));
                });
            });
            if (buttons[0]) {
                activate(buttons[0].getAttribute("data-tab-button"));
            }
        });
    }

    function setupFilters() {
        var cards = selectAll("[data-movie-card]");
        var queryInput = document.querySelector("[data-filter-query]");
        var categorySelect = document.querySelector("[data-filter-category]");
        var regionSelect = document.querySelector("[data-filter-region]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var yearSelect = document.querySelector("[data-filter-year]");
        if (!cards.length || (!queryInput && !categorySelect && !regionSelect && !typeSelect && !yearSelect)) {
            return;
        }
        function currentValue(element) {
            return element ? normalize(element.value) : "";
        }
        function apply() {
            var query = currentValue(queryInput);
            var category = currentValue(categorySelect);
            var region = currentValue(regionSelect);
            var type = currentValue(typeSelect);
            var year = currentValue(yearSelect);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-text"));
                var visible = true;
                if (query && text.indexOf(query) === -1) {
                    visible = false;
                }
                if (category && normalize(card.getAttribute("data-category")) !== category) {
                    visible = false;
                }
                if (region && normalize(card.getAttribute("data-region")) !== region) {
                    visible = false;
                }
                if (type && normalize(card.getAttribute("data-type")) !== type) {
                    visible = false;
                }
                if (year && normalize(card.getAttribute("data-year")) !== year) {
                    visible = false;
                }
                card.classList.toggle("is-hidden", !visible);
            });
        }
        [queryInput, categorySelect, regionSelect, typeSelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q && queryInput) {
            queryInput.value = q;
        }
        apply();
    }

    window.initMoviePlayer = function (streamUrl, videoId, maskId) {
        var video = document.getElementById(videoId);
        var mask = document.getElementById(maskId);
        var hls = null;
        if (!video || !streamUrl) {
            return;
        }
        function attachStream() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            video.setAttribute("data-ready", "1");
        }
        function start() {
            attachStream();
            if (mask) {
                mask.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        }
        if (mask) {
            mask.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupRails();
        setupTabs();
        setupFilters();
    });
})();
