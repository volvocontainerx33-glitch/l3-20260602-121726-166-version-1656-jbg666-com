(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".nav-links");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    if (!inputs.length) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var activeButtonValue = "";

    function cardText(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-type"),
        card.textContent
      ].join(" ").toLowerCase();
    }

    function currentKeyword() {
      var source = inputs.find(function (input) {
        return input.value.trim();
      });
      return source ? source.value.trim().toLowerCase() : "";
    }

    function apply() {
      var keyword = currentKeyword();
      cards.forEach(function (card) {
        var text = cardText(card);
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchButton = !activeButtonValue || text.indexOf(activeButtonValue.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden", !(matchKeyword && matchButton));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", apply);
    });

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeButtonValue = button.getAttribute("data-filter-button") || "";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button && activeButtonValue !== "");
        });
        apply();
      });
    });
  }

  function setupPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".video-box"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".play-mask");
      var message = box.querySelector(".video-message");
      var videoUrl = box.getAttribute("data-video-url");
      var hlsInstance = null;
      var ready = false;

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function attach() {
        if (ready || !videoUrl || !video) {
          return true;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
          ready = true;
          return true;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage("视频暂时无法加载");
            }
          });
          ready = true;
          return true;
        }

        setMessage("视频暂时无法播放");
        return false;
      }

      function play() {
        if (!attach()) {
          return;
        }
        if (button) {
          button.classList.add("is-hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        window.addEventListener("pagehide", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      }
    });
  }
})();
