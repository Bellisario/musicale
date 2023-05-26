<script lang="ts">
  import type ResultsStatus from 'src/types/ResultsStatus';
  import type { Result } from 'src/types/Results';
  import { resultsGetter, loadMoreResults } from '../../lib/resultsGetter';
  import { toSearch } from '../../lib/player';
  import { fade } from 'svelte/transition';

  import Footer from '../Footer.svelte';
  import ResultsItem from './ResultsItem.svelte';
  import ActionButton from '../../lib/ActionButton.svelte';
  import { tick } from 'svelte';

  export let type: ResultsStatus = 'ready';

  $: findResults($toSearch);

  let results: Result[];

  let loadingMore = false;
  let loadingMoreError = false;
  let nextPageToken: string;

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
    nextPageToken = apiRes.nextpage;
    if (results.length > 0) {
      type = 'success';
      return;
    }
    type = 'empty';
  }
  async function loadMore(query: string) {
    const [apiRes, err] = await loadMoreResults(query, nextPageToken);
    if (err) {
      console.error(err);

      return;
    }

    let oldResultsLength = results.length;

    results = [...results, ...apiRes.items];
    nextPageToken = apiRes.nextpage;
    loadingMore = false;

    await tick();

    scrollBehavior(oldResultsLength);
  }
  function scrollBehavior(resultIndex: number) {
    const el = document.querySelector(`.result[data-id="${resultIndex}"]`);
    const toolbar = document.querySelector('.toolbar');

    if (!(el || toolbar)) return;

    scrollTo({
      // allow to see the (old) last result and a part of the previous
      top: el.getBoundingClientRect().top + window.scrollY - toolbar.clientHeight - el.clientHeight * 2,
      behavior: 'smooth',
    });
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
    <div class="center">
      <ActionButton
        on:click={() => {
          if (loadingMore) return;

          loadingMore = true;
          loadMore($toSearch);
        }}
        title={loadingMoreError
          ? 'Error'
          : loadingMore
          ? 'Loading...'
          : 'Load more'}
        backgroundColor="rgba(0, 0, 0, 0.2)"
        disabled={loadingMore}
      />
    </div>
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

  .center {
    display: flex;
    justify-content: center;
  }
</style>
