<script lang="ts">
  // cspell:word xlink spacebar keydown mousedown mousemove mouseup mouseleave
  import { currentTime, duration } from '$store';

  let range: HTMLDivElement = $state() as HTMLDivElement;
  let progressChanging = $state(false);
  let changingPreview = $state(0);
  let progress = $derived(
    (progressChanging ? changingPreview : $currentTime) / $duration,
  );

  function handleMouseDown(e: MouseEvent) {
    if (e.button === 1 || e.button === 2) {
      return;
    }
    progressChanging = true;
    let x = e.offsetX;
    let width = range.offsetWidth;
    let percent = x / width;
    let seconds = percent * $duration;
    changingPreview = seconds;
  }
  function handleMouseMove(e: MouseEvent) {
    if (!progressChanging) return;

    let x = e.offsetX;
    let width = range.offsetWidth;
    let percent = x / width;
    let seconds = percent * $duration;
    changingPreview = seconds;
  }
  function handleMouseUp(e: MouseEvent) {
    if (e.button === 1 || e.button === 2) {
      return;
    }
    progressChanging = false;
    $currentTime = changingPreview;
  }
  function handleMouseLeave(_: MouseEvent) {
    if (!progressChanging) return;

    if (progress <= 0.05 || progress >= 0.95) {
      if (progress <= 0.1) {
        $currentTime = 0;
      } else if (progress >= 0.9) {
        $currentTime = $duration;
      }
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
    width: 75vw;
    height: 0.4em;

    position: relative;

    transition: transform 0.3s ease-in-out;
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
    transform: scale(1, 1.5);
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
