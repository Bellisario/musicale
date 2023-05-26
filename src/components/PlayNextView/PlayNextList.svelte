<script lang="ts">
  import {
    playNextList,
    currentID,
  } from '../../lib/player';
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  import PlayNextItem from './PlayNextItem.svelte';
  import urlToId from '../../lib/urlToId';
</script>

<div class="container">
  <div class="results-grid">
      {#each $playNextList as item, id (item.url)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          animate:flip={{ duration: 300 }}
          transition:fade|local={{ duration: 180 }}
          class="result"
          class:selected={$currentID === urlToId(item.url)}
          data-id={id}
          on:click={() => console.log('clicked')}
        >
          <PlayNextItem result={item} {id} />
        </div>
      {/each}
  </div>
</div>

<style>
  .container {
    scroll-margin-top: calc(var(--bars-height) + 2rem);
    padding: 1rem 0 1rem 0;
  }
  .results-grid {
    display: grid;
    gap: 1em;
    align-content: center;
  }
</style>
