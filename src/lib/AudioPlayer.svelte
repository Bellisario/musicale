<script lang="ts" context="module">
  import { currentTime, duration, paused, volume, source, ended } from './player';
  let el: HTMLAudioElement;
  let looping = false;

  export function play() {
    if (el.src === '') return;
    el.play();
  }
  export function pause() {
    el.pause();
  }
  export function reset() {
    el.pause();
    el.currentTime = 0;
  }
  export function useSource(src: string) {
    el.src = src;
    source.set(src);
  }

  el.addEventListener('ended', () => {
    if (looping) {
      play();
    }
  });
</script>

<div class="player__loop" on:click={() => (looping = !looping)}>
  <svg class="loop-icon" class:active={looping}>
    <use xlink:href="#loop" />
  </svg>
</div>

<audio
  id="audio-player"
  bind:this={el}
  bind:currentTime={$currentTime}
  bind:duration={$duration}
  bind:paused={$paused}
  bind:volume={$volume}
  bind:ended={$ended}
  crossorigin="anonymous"
/>

<style>
  #audio-player {
    display: none;
  }
  .player__loop {
    display: inline-block;
    cursor: pointer;
  }
  .loop-icon {
    width: 20px;
    height: 20px;
  }
  .loop-icon.active {
    fill: green;
  }
</style>
