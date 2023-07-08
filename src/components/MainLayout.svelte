<script lang="ts">
  import {
    poster,
    paused,
    favoritesActive,
    settingsActive,
    menuEntries,
    hash,
  } from '$lib/player';
  import { fade } from 'svelte/transition';
  import PlayingPreview from './PlayingView/PlayingPoster.svelte';
  import FrequencyBars from './PlayingView/FrequencyBars.svelte';
  import Results from './ResultsView/Results.svelte';
  import FavoritesList from './FavoritesView/FavoritesList.svelte';
  import Settings from './SettingsView/Settings.svelte';
  import ContextMenu from './ContextMenu.svelte';
  import PlayNextView from './PlayNextView/PlayNextView.svelte';
  import AlbumView from './AlbumView.svelte';

  let barsVisible = false;
</script>

<PlayNextView />
<ContextMenu bind:entries={$menuEntries} />
<div class="container">
  <div class="playing-grid">
    <PlayingPreview bind:barsVisible />
    <!-- poster changes every music, so it's the same as using the music UUID -->
    {#key $poster}
      {#if barsVisible && !$paused}
        <div class="frequency-bars" transition:fade|global>
          <FrequencyBars />
        </div>
      {/if}
    {/key}
  </div>
  <!-- here goes results/favorites/settings -->
  <div transition:fade|global>
    {#if !$favoritesActive && !$settingsActive && $hash.album}
      <AlbumView id={$hash.album} />
    {:else if !$favoritesActive && !$settingsActive}
      <Results />
    {:else if $favoritesActive}
      <FavoritesList />
    {:else if $settingsActive}
      <Settings />
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
  @media (max-width: 900px) {
    .container {
      grid-template-columns: 1fr;
    }
    .playing-grid {
      display: none;
    }
  }
</style>
