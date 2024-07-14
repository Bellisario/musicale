<script lang="ts">
  // cspell:word xlink spacebar keydown mousedown mousemove mouseup mouseleave
  import { volume } from '$lib/player';
  import { onMount, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let progress = 0;
  let range: HTMLDivElement;
  let progressChanging = false;

  $: progress = $volume;

  {
    let clock: NodeJS.Timeout;
    function dispatchAutoClose() {
      return setTimeout(() => {
        dispatch('autoClose');
      }, 3000);
    }
    volume.subscribe(() => {
      clearTimeout(clock);
      clock = dispatchAutoClose();
    });
  }

  // if volume < 0 || > 1, set to 0 or 1
  function sanitizeVolume(volume: number) {
    let sanitized1 = volume < 0 ? 0 : volume;
    let sanitized2 = sanitized1 > 1 ? 1 : sanitized1;
    return sanitized2;
  }

  onMount(() => {
    // listen for click start
    range.addEventListener('mousedown', (e) => {
      if (e.button === 1 || e.button === 2) {
        return;
      }
      progressChanging = true;
      let x = e.offsetX;
      let width = range.offsetWidth;
      let percent = x / width;

      $volume = sanitizeVolume(percent);
    });
    // listen for mouse move
    range.addEventListener('mousemove', (e) => {
      if (!progressChanging) return;

      let x = e.offsetX;
      let width = range.offsetWidth;
      let percent = x / width;

      $volume = sanitizeVolume(percent);
    });
    // listen for click end
    range.addEventListener('mouseup', (e) => {
      if (e.button === 1 || e.button === 2) {
        return;
      }
      progressChanging = false;
    });

    range.addEventListener('mouseleave', (_) => {
      if ($volume <= 0.05 || $volume >= 0.95) {
        $volume = $volume <= 0.05 ? 0 : 1;
        progressChanging = false;
      }
    });
  });
</script>

<div
  class="player__range"
  style="--progress: {progress || 0}"
  bind:this={range}
>
  <div class="player__volume-range">
    <div class="volume-range__selector" />
    <div class="volume-range__main" />
  </div>
</div>

<style>
  .player__range {
    --b-radius: 1em;
    display: inline-block;
    width: 10vw;
    height: 0.4em;

    position: relative;

    transition: transform 0.3s ease-in-out;

    /* fix for vertical center */
    top: -0.1em;
  }
  .volume-range__selector {
    position: absolute;
    top: -0.6em;
    left: 0;
    width: 100%;
    height: 400%;
    background-color: transparent;
    vertical-align: middle;
  }
  .volume-range__selector:hover + .volume-range__main {
    transform: scaleY(1.5);
  }
  /* progress bar container */
  .volume-range__main {
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--back-color);
    border-radius: var(--b-radius);
    transition: transform 0.3s ease-in-out;
    overflow: hidden;
  }
  .volume-range__main:hover {
    transform: scaleY(1.5);
  }
  /* progress bar */
  .volume-range__main::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: translateX(calc(100% * var(--progress) - 100%));
    background-color: var(--theme-color);
    vertical-align: middle;
    border-radius: var(--b-radius);
  }
</style>
