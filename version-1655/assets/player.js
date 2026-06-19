(function () {
  function initPlayer() {
    var video = document.querySelector('video[data-source]');
    var button = document.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-source');
    var hlsInstance = null;

    function attachSource(onReady) {
      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (typeof onReady === 'function') {
              onReady();
            }
          });
        } else if (typeof onReady === 'function') {
          onReady();
        }
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', source);
        }
        if (typeof onReady === 'function') {
          onReady();
        }
        return;
      }

      if (!video.getAttribute('src')) {
        video.setAttribute('src', source);
      }
      if (typeof onReady === 'function') {
        onReady();
      }
    }

    function startPlayback() {
      attachSource(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    initPlayer();
  }
})();
