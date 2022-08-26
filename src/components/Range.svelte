<script type="ts">
  // cspell:word xlink spacebar keydown mousedown mousemove mouseup
  import { currentTime, duration } from '../lib/player';
  import { onMount } from 'svelte';

  let progress = 0;
  let range: HTMLDivElement;
  let progressChanging = false;
  let changingPreview = 0;

  $: progress = (progressChanging ? changingPreview : $currentTime) / $duration;

  onMount(() => {
    // listen for click start
    range.addEventListener('mousedown', (e) => {
      if (e.which === 2 || e.which === 3) {
        return;
      }
      progressChanging = true;
      let x = e.offsetX;
      let width = range.offsetWidth;
      let percent = x / width;
      let seconds = percent * $duration;
      changingPreview = seconds;
    });
    // listen for mouse move
    range.addEventListener('mousemove', (e) => {
      if (!progressChanging) return;

      let x = e.offsetX;
      let width = range.offsetWidth;
      let percent = x / width;
      let seconds = percent * $duration;
      changingPreview = seconds;
    }),
      // listen for click end
      range.addEventListener('mouseup', (e) => {
        if (e.which === 2 || e.which === 3) {
          return;
        }
        progressChanging = false;
        $currentTime = changingPreview;
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
    width: 75vw;
    height: 0.4em;

    position: relative;

    transition: transform 0.3s ease-in-out;
    /* overflow: hidden; */
  }
  .volume-range__selector {
    position: absolute;
    top: -0.6em;
    left: 0;
    width: 100%;
    height: 400%;
    background-color: transparent;
    /* background-color: rgb(255, 0, 0, 0.322); */
    vertical-align: middle;
  }
  .volume-range__selector:hover + .volume-range__main {
    transform: scaleY(1.5);
  }
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
  .volume-range__main::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    /* width: calc(100% * var(--progress)); */
    width: 100%;
    height: 100%;
    transform: translateX(calc(100% * var(--progress) - 100%));
    /* background-color: rgb(0, 255, 0, 0.322); */
    background-color: var(--theme-color);
    vertical-align: middle;
    border-radius: var(--b-radius);
  }
</style>

