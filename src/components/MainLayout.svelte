<script type="ts">
  import { poster, paused, favoritesActive } from '../lib/player';
  import { fade } from 'svelte/transition';
  import PlayingPreview from './PlayingPreview.svelte';
  import FrequencyBars from './FrequencyBars.svelte';
  import Results from './Results.svelte';
  import FavoritesList from './FavoritesList.svelte';

  let barsVisible = false;

  let smallScreen = false;

  window.addEventListener('resize', () => {
    smallScreen = window.innerWidth < 900;
  });
</script>

<div class="container">
  <div class="playing-grid" class:hiding={smallScreen}>
    <PlayingPreview bind:barsVisible />
    <!-- poster changes every music, so it's the same as using the music UUID -->
    {#key $poster}
      {#if barsVisible && !$paused}
        <div class="frequency-bars" transition:fade>
          <FrequencyBars />
        </div>
      {/if}
    {/key}
  </div>
  <!-- here goes results/favorites -->
  <div transition:fade>
    {#if !$favoritesActive}
      <Results />
    {:else}
      <FavoritesList />
    {/if}
  </div>
</div>

<style>
  .container {
    /* prevents toolbar hiding content */
    margin-top: 4em;

    display: grid;
    grid-template-columns: 30vw 70vw;
  }
  .frequency-bars {
    position: fixed;
    bottom: 4em;
    left: 0.5em;
    z-index: -1;
    width: 30vw;
  }
  .playing-grid.hiding {
    display: none;
  }
</style>
