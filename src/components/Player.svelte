<script type="ts">
  // cspell:word xlink spacebar keydown mousedown mousemove mouseup keyframes webp seekbackward seekforward

  import Range from './Range.svelte';
  import VolumeRange from './VolumeRange.svelte';
  import {
    currentTime,
    duration,
    secondsToTime,
    paused,
    musicTitle,
    artist,
    poster,
    volume,
  } from '../lib/player';
  import { play, pause } from '../lib/AudioPlayer.svelte';

  import { readable } from 'svelte/store';
  import { fade } from 'svelte/transition';
  import clickOutside from '../lib/clickOutside';

  let smallScreen = false;

  window.addEventListener('resize', () => {
    smallScreen = window.innerWidth < 900;
  });

  let progressChanging = false;
  let changingPreview = 0;

  let playPauseChanging = false;
  let volumeRangeShowing = false;

  const type = readable('play', (set) => {
    paused.subscribe((paused) => {
      playPauseChanging = true;
      setTimeout(() => {
        set(paused ? 'play' : 'pause');
      }, 150);
      setTimeout(() => {
        playPauseChanging = false;
      }, 300);
    });
  });

  paused.subscribe(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: $musicTitle,
        artist: $artist,
        album: '',
        artwork: [
          {
            src: $poster,
            sizes: '1280x720',
            type: 'image/webp',
          },
        ],
      });
    }
  });
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => {
      play();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      pause();
    });
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      currentTime.set($currentTime - 10);
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      currentTime.set($currentTime + 10);
    });
  }

  function toggle() {
    $type === 'play' ? play() : pause();
  }

  // listen for spacebar
  window.addEventListener('keydown', (e) => {
    // if focusing elements (ex. input) don't do anything
    if (document.activeElement !== document.body) return;

    if (e.code === 'Space') {
      e.preventDefault();
      toggle();

      return;
    }

    if (e.key === 'ArrowRight') {
      // e.preventDefault();
      let newTime = $currentTime + 5;

      // prevent going over duration
      if (newTime > $duration) newTime = $duration;

      $currentTime = newTime;

      return;
    }

    if (e.key === 'ArrowLeft') {
      // e.preventDefault();
      let newTime = $currentTime - 5;

      // prevent going under 0
      if (newTime < 0) newTime = 0;

      $currentTime = newTime;

      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      let newVolume = $volume + 0.01;

      // prevent going over 1
      if (newVolume > 1) newVolume = 1;

      // show volume range
      volumeRangeShowing = true;

      $volume = newVolume;

      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      let newVolume = $volume - 0.01;

      // prevent going under 0
      if (newVolume < 0) newVolume = 0;

      // show volume range
      volumeRangeShowing = true;

      $volume = newVolume;

      return;
    }
  });
</script>

<div class="player">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="player__play-pause" on:click={toggle}>
    <div
      class="play-pause__icon {$type} {playPauseChanging ? 'changing' : ''}"
    />
  </div>
  <Range />
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <div
    class="player__volume"
    class:hiding={smallScreen}
    on:mouseover={() => (volumeRangeShowing = true)}
    use:clickOutside={() => (volumeRangeShowing = false)}
  >
    <svg class="volume-icon">
      <use xlink:href="#volume" />
    </svg>
    {#if volumeRangeShowing}
      <div class="volume__container" transition:fade>
        <VolumeRange on:autoClose={() => (volumeRangeShowing = false)} />
      </div>
    {/if}
  </div>
  <div class="player__info">
    <div class="player__current-time">
      {secondsToTime(progressChanging ? changingPreview : $currentTime)}
    </div>
    <span class="info__divider">/</span>
    <div class="player__duration">
      {secondsToTime($duration)}
    </div>
  </div>
</div>
<svg style="display: none;">
  <symbol id="volume" viewBox="0 0 24 24">
    <path
      d="M6 7l8-5v20l-8-5v-10zm-6 10h4v-10h-4v10zm20.264-13.264l-1.497 1.497c1.847 1.783 2.983 4.157 2.983 6.767 0 2.61-1.135 4.984-2.983 6.766l1.498 1.498c2.305-2.153 3.735-5.055 3.735-8.264s-1.43-6.11-3.736-8.264zm-.489 8.264c0-2.084-.915-3.967-2.384-5.391l-1.503 1.503c1.011 1.049 1.637 2.401 1.637 3.888 0 1.488-.623 2.841-1.634 3.891l1.503 1.503c1.468-1.424 2.381-3.309 2.381-5.394z"
    />
  </symbol>
</svg>

<style>
  .player {
    position: sticky;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 0.5em;
    background-color: var(--bars-color);
    height: var(--bars-height);
    width: 100%;
    bottom: 0;
    backdrop-filter: blur(var(--bars-back-blur));
  }
  .player__current-time,
  .player__duration {
    display: inline-block;
    min-width: 2.75em;
  }
  .player__current-time {
    margin-right: -0.25em;
  }
  .info__divider {
    color: var(--theme-color);
    font-weight: 800;
  }
  .player__range {
    --b-radius: 1em;
    display: inline-block;
    min-width: 30%;
    width: 75%;
    height: 0.4em;

    position: relative;

    transition: transform 0.3s ease-in-out;
  }
  .player__play-pause {
    display: inline-block;
    position: relative;
  }
  .player__play-pause::before {
    content: '';
    position: absolute;
    inset: -0.5em;
    border-radius: 50%;
  }
  .play-pause__icon {
    background-color: var(--theme-color);
    width: 1.75em;
    height: 1.75em;
  }
  .play-pause__icon.changing {
    animation: play-pause-icon-animation 0.3s ease-in-out;
  }
  @keyframes play-pause-icon-animation {
    100% {
      transform: rotate(360deg);
    }
  }
  .play-pause__icon.play {
    clip-path: polygon(0 0, 100% 50%, 0 100%);
  }
  .play-pause__icon.pause {
    clip-path: polygon(
      30% 0,
      30% 100%,
      10% 100%,
      10% 0,
      70% 0,
      70% 100%,
      90% 100%,
      90% 0
    );
  }
  .volume-icon {
    display: inline-block;
    width: 1.75em;
    height: 1.75em;
    fill: var(--theme-color);
    vertical-align: middle;
  }
  .player__volume {
    position: relative;
    isolation: isolate;
  }
  .player__volume.hiding {
    display: none;
  }
  /* adds some more click radius to button */
  .player__volume::before {
    content: '';
    position: absolute;
    inset: -0.5em;
    border-radius: 50%;
  }
  .volume__container {
    position: absolute;
    right: -4em;
    top: -4em;
    background-color: var(--bars-color);
    padding: 0.5em 0.75em;
    border-radius: 7.5px;
    box-shadow: var(--theme-shadow);
  }
</style>
