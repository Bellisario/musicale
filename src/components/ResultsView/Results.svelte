<script lang="ts">
  import type { Result } from '$types/Results';
  import {
    resultsGetter,
    loadMoreResults,
    resultsAlbumGetter,
  } from '$lib/resultsGetter';
  import { currentSearchType, hash } from '$lib/player';
  import { fade } from 'svelte/transition';

  import Footer from '../Footer.svelte';
  import ResultsItem from './ResultsItem.svelte';
  import ActionButton from '$lib/ActionButton.svelte';
  import { tick } from 'svelte';
  import TextSwitch from '$lib/TextSwitch.svelte';
  import type { AlbumResult } from '$types/AlbumResults';
  import AlbumResultsItem from './AlbumResultsItem.svelte';

  let results: Result[];
  let albumResults: AlbumResult[];

  let loadingMore = false;
  let loadingMoreError = false;
  let nextPageToken: string;

  async function findResults(query: string) {
    if ($currentSearchType === 0) {
      const apiRes = await resultsGetter(query);
      results = apiRes.items;

      nextPageToken = apiRes.nextpage;

      return;
    }

    const apiRes = await resultsAlbumGetter(query);
    albumResults = apiRes.items;
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

    if (!el || !toolbar) return;

    scrollTo({
      // allow to see the (old) last result and a part of the previous
      top:
        el.getBoundingClientRect().top +
        window.scrollY -
        toolbar.clientHeight -
        el.clientHeight * 2,
      behavior: 'smooth',
    });
  }
</script>

<div class="container">
  {#if $hash.search?.trim() === '' || !$hash.search}
    <div class="message" in:fade|global>
      <div class="texts">
        <h1>Search for something</h1>
        <p>Try searching for something to see results there.</p>
      </div>
      <Footer size="small" />
    </div>
  {:else}
    <div in:fade|global>
      <TextSwitch
        label="Searching as:"
        options={['Music', 'Album']}
        bind:selected={$currentSearchType}
      />
    </div>
    <div class="results-grid">
      {#key $currentSearchType}
        {#await findResults($hash.search.trim())}
          <div in:fade|global={{ delay: 1000 }} class="loading">
            Loading... <span in:fade|global={{ delay: 4000 }}
              >this seems to take some more time...</span
            ><br /><span in:fade|global={{ delay: 7000 }}
              >Maybe there is a problem with API? Anyway no error for now.
              Working on...</span
            >
          </div>
        {:then}
          {#if $currentSearchType === 0}
            {#each results as result, id}
              <ResultsItem {result} {id} />
            {/each}
            <div class="center">
              <ActionButton
                on:click={() => {
                  if (loadingMore) return;

                  loadingMore = true;

                  if (!$hash.search)
                    throw new Error(
                      '$hash.search was expected to be a string here'
                    );

                  loadMore($hash.search.trim());
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
          {:else}
            <div class="albums">
              {#each albumResults as album}
                <AlbumResultsItem {album} />
              {/each}
            </div>
          {/if}
          <Footer />
        {:catch}
          <div class="message" in:fade|global>
            <div class="texts">
              <h1>Something went wrong</h1>
              <p>Try again.</p>
            </div>
            <Footer size="small" />
          </div>
        {/await}
      {/key}
    </div>
  {/if}
</div>

<style>
  .container {
    --padding: 2em;

    padding: var(--padding);

    min-height: calc(100vh - var(--bars-height) * 2);

    position: relative;
  }
  .results-grid {
    display: grid;
    gap: 1em;

    /* separate TextSwitch */
    margin-top: 1em;
    /* prevent bottom content from staying under the bars */
    margin-bottom: var(--bars-height);
  }
  .message {
    /* quick fix for footer positioning (should be re-written completely) */
    display: grid;
    grid-template-rows: 1fr min-content;

    min-height: calc(100vh - var(--bars-height) * 2 - var(--padding) * 2);
  }

  .center {
    display: flex;
    justify-content: center;
  }

  .albums {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12em, 1fr));
    gap: 1.5em;
    align-items: start;

    margin-right: 5rem;
  }
</style>
