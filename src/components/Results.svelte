<script lang="ts">
  import type ResultsStatus from 'src/types/ResultsStatus';
  import type { Result } from 'src/types/Results';
  import resultsGetter from '../lib/resultsGetter';
  import { toSearch } from '../lib/player';
  import { fade } from 'svelte/transition';

  import Footer from './Footer.svelte';
  import ResultsItem from './ResultsItem.svelte';

  export let type: ResultsStatus = 'ready';

  $: findResults($toSearch);

  let results: Result[];

  async function findResults(query: string) {
    if (query.trim() === '') {
      type = 'ready';
      return;
    }
    type = 'loading';
    const [apiRes, err] = await resultsGetter(query);
    if (err) {
      type = 'error';
      console.error(err);
      return;
    }
    results = apiRes.items;
    if (results.length > 0) {
      type = 'success';
      return;
    }
    type = 'empty';
  }
</script>

<div class="results-grid">
  {#if type === 'ready'}
    <div class="default grid-content" in:fade>
      <div class="texts">
        <h1>Search for something</h1>
        <p>Try searching for something to see results there.</p>
      </div>
      <Footer size="small" />
    </div>
  {:else if type === 'loading'}
    <div in:fade={{ delay: 1000 }} class="loading">
      Loading... <span in:fade={{ delay: 4000 }}
        >this seems to take some more time...</span
      ><br /><span in:fade={{ delay: 7000 }}
        >Maybe there is a problem with API? Anyway no error for now. Working
        on...</span
      >
    </div>
  {:else if type === 'success'}
    {#each results as result, id}
      <ResultsItem {result} {id} />
    {/each}
    <Footer />
  {:else if type === 'empty'}
    <div class="empty grid-content" in:fade>
      <div class="texts">
        <h1>No result</h1>
        <p>
          Seems there is no result for your query, try with different words.
        </p>
      </div>
      <Footer size="small" />
    </div>
  {:else if type === 'error'}
    <div class="error grid-content" in:fade>
      <div class="texts">
        <h1>Something went wrong</h1>
        <p>Try again.</p>
      </div>
      <Footer size="small" />
    </div>
  {/if}
</div>

<style>
  .results-grid {
    display: grid;
    gap: 1em;
    padding: 2em;
    min-height: calc(100vh - var(--bars-height) * 2);
  }

  .results-grid .grid-content {
    display: grid;
    grid-template-rows: 1fr min-content;
  }
</style>
