<script lang="ts" context="module">
  import { currentTime, duration, paused, volume } from './player';
  // import { onMount } from 'svelte';

  // let el: HTMLAudioElement;

  // export let paused = false;
  // export let source: string = '';
  // export let volume: number = 1;

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
  }
</script>

<audio id="audio-player" bind:this={el} bind:currentTime={$currentTime} bind:duration={$duration} bind:paused={$paused} bind:volume={$volume} />

<style>
  #audio-player {
    display: none;
  }
</style>
