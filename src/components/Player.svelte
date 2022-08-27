<script type="ts">
  // cspell:word xlink spacebar keydown mousedown mousemove mouseup keyframes

  import Range from './Range.svelte';
  import VolumeRange from './VolumeRange.svelte';
  import { currentTime, duration, secondsToTime, paused } from '../lib/player';
  import { play, pause } from '../lib/AudioPlayer.svelte';

  import { readable } from 'svelte/store';
  import { fade } from 'svelte/transition';
  import clickOutside from '../lib/clickOutside';

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

  function toggle() {
    $type === 'play' ? play() : pause();
  }

  // listen for spacebar
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement === document.body) {
      e.preventDefault();
      toggle();
    }
  });
</script>

<div class="player">
  <div class="player__play-pause" on:click={toggle}>
    <div
      class="play-pause__icon {$type} {playPauseChanging ? 'changing' : ''}"
    />
  </div>
  <Range />
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <div
    class="player__volume"
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
  .player__range {
    --b-radius: 1em;
    display: inline-block;
    width: 75vw;
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
