<script lang="ts" context="module">
  // cspell:word crossorigin

  import {
    currentTime,
    duration,
    paused,
    volume,
    source,
    ended,
  } from './player';

  let el: HTMLAudioElement;

  export function play() {
    // prevent play if there is no source set
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
</script>

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
</style>
