<script lang="ts">
  import { playNextList } from '$lib/player';

  import PlayNextItem from './PlayNextItem.svelte';
  import Orderable from '$lib/Orderable.svelte';
</script>

<div class="container">
  <div class="results-grid">
    <Orderable
      class="list"
      bind:itemsData={$playNextList}
      Item={PlayNextItem}
      dataType="play_next"
      gap="1rem"
    />
  </div>
</div>

<style>
  .container {
    scroll-margin-top: calc(var(--bars-height) + 2rem);
    padding-bottom: 0.5rem;
  }
  .results-grid {
    display: grid;
    gap: 1em;
    align-content: center;
  }
</style>
