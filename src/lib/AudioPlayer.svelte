<script lang="ts" context="module">
  // cspell:word crossorigin

  import {
    currentTime,
    duration,
    paused,
    volume,
    source,
    ended,
    failedStreamURLs,
  } from './player';

  let el: HTMLAudioElement;
  let lastApiUrl: string;
  let fallbackFunction: () => void;

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
  export function useSource(
    src: string,
    API_URL: string,
    fallback: () => void
  ) {
    el.src = src;
    source.set(src);

    lastApiUrl = API_URL;
    fallbackFunction = fallback;
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
  on:error={() => {
    console.log('Error loading audio with:', lastApiUrl);
    console.log('Removing this API from the list of available APIs');

    $failedStreamURLs = [...$failedStreamURLs, lastApiUrl];

    fallbackFunction();
  }}
  crossorigin="anonymous"
/>

<style>
  #audio-player {
    display: none;
  }
</style>
