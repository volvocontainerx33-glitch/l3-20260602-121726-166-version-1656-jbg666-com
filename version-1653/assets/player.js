(function () {
  var video = document.getElementById("moviePlayer");
  var cover = document.querySelector(".player-cover");
  var playButton = document.querySelector(".player-play");

  if (!video) {
    return;
  }

  var sourceNode = video.querySelector("source");
  var streamUrl = sourceNode ? sourceNode.getAttribute("src") : "";
  var attached = false;
  var hlsInstance = null;

  function attachStream() {
    if (attached || !streamUrl) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      attached = true;
      return;
    }

    video.src = streamUrl;
    attached = true;
  }

  function startPlayback() {
    attachStream();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (playButton) {
    playButton.addEventListener("click", startPlayback);
  }

  if (cover) {
    cover.addEventListener("click", startPlayback);
  }

  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
