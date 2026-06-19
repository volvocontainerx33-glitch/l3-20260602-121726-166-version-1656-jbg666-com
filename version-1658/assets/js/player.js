function initMoviePlayer(sourceUrl) {
  var player = document.querySelector("[data-player]");
  if (!player || !sourceUrl) {
    return;
  }

  var video = player.querySelector("video");
  var cover = player.querySelector(".player-cover");
  var button = player.querySelector(".player-start");
  var error = player.querySelector(".player-error");
  var isReady = false;
  var hls = null;

  function setError(message) {
    if (!error) {
      return;
    }
    error.textContent = message;
    error.hidden = false;
  }

  function attachSource() {
    if (isReady || !video) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      isReady = true;
      return;
    }

    if (window.Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setError("视频加载失败，请稍后重试");
          if (hls) {
            hls.destroy();
            hls = null;
            isReady = false;
          }
        }
      });
      isReady = true;
      return;
    }

    setError("视频加载失败，请稍后重试");
  }

  function startPlay() {
    attachSource();
    if (!video) {
      return;
    }
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.setAttribute("controls", "controls");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener("click", startPlay);
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      startPlay();
    });
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlay();
      }
    });
  }
}
