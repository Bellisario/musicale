<script lang="ts">
  // cspell:word xlink spacebar keydown mousedown mousemove mouseup mouseleave
  import { volume } from '$store';

  interface Props {
    autoClose: () => void;
  }
  const { autoClose }: Props = $props();

  let progress = $derived($volume);
  let range: HTMLDivElement = $state() as HTMLDivElement;
  let progressChanging = false;

  {
    let clock: number;
    function dispatchAutoClose() {
      return setTimeout(() => {
        autoClose();
      }, 3000);
    }
    volume.subscribe(() => {
      clearTimeout(clock);
      clock = dispatchAutoClose();
    });
  }

  // if volume < 0 || > 1, set to 0 or 1
  function sanitizeVolume(volume: number) {
    return Math.min(Math.max(volume, 0), 1);
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.button === 1 || e.button === 2) {
      return;
    }
    progressChanging = true;
    let x = e.offsetX;
    let width = range.offsetWidth;
    let percent = x / width;

    $volume = sanitizeVolume(percent);
  }
  function handleMouseMove(e: MouseEvent) {
    if (!progressChanging) return;

    let x = e.offsetX;
    let width = range.offsetWidth;
    let percent = x / width;

    $volume = sanitizeVolume(percent);
  }
  function handleMouseUp(e: MouseEvent) {
    if (e.button === 1 || e.button === 2) {
      return;
    }
    progressChanging = false;
  }
  function handleMouseLeave(_: MouseEvent) {
    if ($volume <= 0.05 || $volume >= 0.95) {
      $volume = $volume <= 0.05 ? 0 : 1;
      progressChanging = false;
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="player__range"
  style="--progress: {progress || 0}"
  onmousedown={handleMouseDown}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
  onmouseleave={handleMouseLeave}
  bind:this={range}
>
  <div class="player__volume-range">
    <div class="volume-range__selector"></div>
    <div class="volume-range__main"></div>
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
