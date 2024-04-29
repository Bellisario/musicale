<script lang="ts">
  // cspell:word spacebar seekbackward seekforward nums

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
    playNextList,
    playNextIndex,
    previousNextButtonsPreference,
  } from '$lib/player';
  import { play, pause } from '$lib/AudioPlayer.svelte';

  import { fade } from 'svelte/transition';
  import clickOutside from '$lib/clickOutside';

  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import {
    playNextSong,
    playPreviousSong,
  } from '$components/PlayNextView/PlayNextController';

  let smallScreen = false;

  window.addEventListener('resize', () => {
    smallScreen = window.innerWidth < 900;
  });

  let progressChanging = false;
  let changingPreview = 0;

  let volumeRangeShowing = false;

  let resetStatus: 'none' | 'working' | 'done' = 'none';
  let resetTimeout: NodeJS.Timeout;

  // expressed in REMs
  let playerButtonsWidth = tweened(1.75, {
    duration: 300,
    easing: cubicOut,
  });

  let playNextListUnsubscribe = () => {};
  previousNextButtonsPreference.subscribe((status) => {
    if (status === 'off') {
      playerButtonsWidth.set(1.75);
      playNextListUnsubscribe();
      return;
    }

    playNextListUnsubscribe = playNextList.subscribe((val) => {
      if (val.length === 0) return playerButtonsWidth.set(1.75);

      playerButtonsWidth.set(1.75 /*rem*/ * 3 /* buttons*/ + 2 /*rem for gap*/);
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
    $paused ? play() : pause();
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

    if (e.key === 'ArrowRight' && !e.metaKey) {
      // e.preventDefault();
      let newTime = $currentTime + 5;

      // prevent going over duration
      if (newTime > $duration) newTime = $duration;

      $currentTime = newTime;

      return;
    }

    if (e.key === 'ArrowLeft' && !e.metaKey) {
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

  function handleResetBegin(e: KeyboardEvent) {
    // if focusing elements (ex. input) don't do anything
    if (document.activeElement !== document.body) return;

    if (e.code === 'Numpad0' && resetStatus === 'none' && $currentTime !== 0) {
      e.preventDefault();
      resetStatus = 'working';
      resetTimeout = setTimeout(() => {
        resetStatus = 'done';
        $currentTime = 0;
        pause();
        setTimeout(() => {
          resetStatus = 'none';
        }, 2000);
      }, 1500);
      return;
    }
  }
  function handleResetEnd(e: KeyboardEvent) {
    // if focusing elements (ex. input) don't do anything
    if (document.activeElement !== document.body) return;

    if (e.code === 'Numpad0') {
      e.preventDefault();
      if (resetStatus === 'working') {
        clearTimeout(resetTimeout);
        resetStatus = 'none';
      }
      return;
    }
  }
</script>

<svelte:body on:keydown={handleResetBegin} on:keyup={handleResetEnd} />

<div class="player translucent">
  {#if resetStatus !== 'none'}
    <div class="reset-message" transition:fade|global>
      {resetStatus === 'done'
        ? 'Done!'
        : 'Keep pressing to reset playing time...'}
    </div>
  {/if}
  <div class="player__buttons" style="--buttons-width:{$playerButtonsWidth}rem">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="player-button player__previous-button"
      class:disabled={$playNextIndex === 0}
      on:click={playPreviousSong}
    >
      <svg class="double-arrow-icon">
        <use xlink:href="#double-arrow" />
      </svg>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="player__play-pause" on:click={toggle}>
      <div class="play-pause__icon" class:pause={!$paused} />
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="player-button player__next-button"
      class:disabled={$playNextList.length - 1 === $playNextIndex}
      on:click={playNextSong}
    >
      <svg class="double-arrow-icon">
        <use xlink:href="#double-arrow" />
      </svg>
    </div>
  </div>
  <Range />
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
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
      <div class="volume__container translucent" transition:fade|global>
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
  <symbol id="double-arrow" viewBox="0 0 24 24">
    <g id="layer1" transform="translate(-1.2345222e-7,-2.9999998)">
      <path
        d="m 18.292605,7.7669902 -7.574831,4.3733308 0,-8.7466618 z"
        transform="matrix(1.9802421,0,0,2.057928,-12.223787,-3.9839066)"
      />
      <path
        d="m 18.292605,7.7669902 -7.574831,4.3733308 0,-8.7466618 z"
        transform="matrix(1.9802421,0,0,2.057928,-21.223787,-3.9839066)"
      />
    </g>
  </symbol>
</svg>

<style>
  .player {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    height: var(--bars-height);
    width: 100%;
    bottom: 0;

    z-index: 200;
  }
  .player__current-time,
  .player__duration {
    display: inline-block;
    font-variant-numeric: tabular-nums;
  }
  .info__divider {
    color: var(--theme-color);
    font-weight: 800;
  }
  .player__buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    overflow: hidden;
    height: auto;
    animation: width 250ms ease;

    width: var(--buttons-width, 1.75rem);
  }
  .player-button {
    transition: opacity 250ms ease;
  }
  .player-button.disabled {
    opacity: 0.5;
    pointer-events: none;
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
    clip-path: polygon(
      5% 0%,
      100% 50%,
      100% 50%,
      5% 100%,
      5% 0%,
      5% 0%,
      5% 100%,
      5% 100%,
      5% 0%
    );

    transition: 250ms ease;
  }
  .play-pause__icon.pause {
    clip-path: polygon(
      70% 0%,
      95% 0%,
      95% 100%,
      70% 100%,
      70% 0%,
      30% 0%,
      30% 100%,
      5% 100%,
      5% 0%
    );
  }
  .player__previous-button {
    transform: scaleX(-1);
  }
  .volume-icon,
  .double-arrow-icon {
    display: inline-block;
    width: 1.75em;
    height: 1.75em;
    fill: var(--theme-color);
    vertical-align: middle;
  }
  .double-arrow-icon {
    /* quick alignment fix */
    transform: translateY(0.2rem);
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
    padding: 0.5em 0.75em;
    border-radius: 7.5px;
    box-shadow: var(--theme-shadow);
  }

  .reset-message {
    position: absolute;
    top: -2em;
    left: 1em;
    font-size: 0.9em;
    pointer-events: none;
  }
</style>
