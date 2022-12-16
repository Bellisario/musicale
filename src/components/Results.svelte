<script lang="ts">
  import type ResultsStatus from 'src/types/ResultsStatus';
  import type { Result } from 'src/types/Results';
  import urlToId from '../lib/urlToId';
  import audioStreamGetter from '../lib/audioStreamGetter';
  import { play, useSource, reset } from '../lib/AudioPlayer.svelte';
  import resultsGetter from '../lib/resultsGetter';
  import IntersectionObserver from '../lib/IntersectionObserver.svelte';
  import {
    musicTitle,
    poster,
    artist,
    toSearch,
    currentID,
    smallPoster,
    favorites,
  } from '../lib/player';
  import { fade } from 'svelte/transition';

  import truncate from 'just-truncate';
  import Footer from './Footer.svelte';
  import loveIcon from '../assets/love.svg?raw';

  export let type: ResultsStatus = 'ready';

  $: findResults($toSearch);

  let results: Result[];

  let selectedResult = {
    id: -1,
    uuid: '',
  };

  let canReplaySong = true;

  async function wantPlay(result: Result, selectedId: number) {
    // reset currentID while fetching
    $currentID = '';

    const id = urlToId(result.url);

    $musicTitle = result.title;

    const currentResult = {
      id: selectedId,
      uuid: id,
    };

    // prevent song replay if clicks on the same song again before loading
    if (selectedResult.uuid === currentResult.uuid && !canReplaySong) {
      return;
    }
    canReplaySong = false;

    selectedResult = currentResult;
    // reset the current audio stream
    reset();
    const apiRes = await audioStreamGetter(id);

    $poster = apiRes.thumbnailUrl;
    $smallPoster = result.thumbnail;
    $artist = result.uploaderName;

    const streamUrl = apiRes.audioStreams.filter(
      (stream) => stream.mimeType === 'audio/mp4'
    )[0].url;
    console.log(streamUrl);
    useSource(streamUrl);
    play();
    canReplaySong = true;
    $currentID = id;
  }

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

  const lazyLoad = (el: HTMLDivElement) => {
    el.onload = () => {
      el.style.opacity = '1';
    };
  };
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
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        in:fade
        class="result"
        class:selected={$currentID === urlToId(result.url)}
        data-id={id}
        on:click={() => wantPlay(result, id)}
      >
        <div class="result__grid1" style="--img: url('{result.thumbnail}')">
          <IntersectionObserver let:intersecting top={150} once={true}>
            <img
              src={intersecting ? result.thumbnail : ''}
              alt={result.title}
              class="result__img"
              use:lazyLoad
            />
          </IntersectionObserver>
        </div>
        <div class="result__grid2">
          <div class="result__title">
            <h2
              title={result.title !== truncate(result.title, 40)
                ? result.title
                : null}
            >
              {truncate(result.title, 40)}
            </h2>
            {#if $favorites.map((a) => a.id).includes(urlToId(result.url))}
              <div class="result__loved" transition:fade|local>
                {@html loveIcon}
              </div>
            {/if}
          </div>
          <p>{result.uploaderName}</p>
        </div>
      </div>
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
  img {
    user-select: none;
    pointer-events: none;
  }
  .results-grid {
    display: grid;
    gap: 1em;
    padding: 2em;
    min-height: calc(100vh - var(--bars-height) * 2);
  }
  .result {
    display: grid;
    gap: 0.5em;
    grid-template-columns: max-content;
    width: max-content;
  }
  .result > * {
    cursor: pointer;
  }
  .result__title {
    position: relative;
    width: max-content;
  }
  .result__title > h2 {
    overflow: hidden;
    position: relative;
    /* prevent text overflow by allowing a little more space */
    width: calc(100% + 0.1em);
  }
  .result__title > h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 0.1rem;
    background-color: var(--theme-color);
    opacity: 0;
    transition: opacity 300ms, transform 300ms;
  }
  .result.selected .result__title > h2::after {
    transform: translate3d(-100%, 0, 0);
    opacity: 1;
  }

  .result__grid1 {
    grid-column: 1;
    width: 6em;
    height: 6em;
    background-color: var(--bars-color);
    border-radius: 10%;
    box-shadow: var(--theme-shadow);

    overflow: hidden;
  }
  .result__img {
    width: 6em;
    height: 6em;
    transform-origin: center;
    /* image is a little to small, scaling it */
    transform: scale(1.085);
    opacity: 0;
    transition: opacity 0.5s ease-in;
  }
  .result__grid2 {
    grid-column: 2;
    margin-block: auto;
  }
  .result__loved {
    position: absolute;
    top: calc(50% - 0.5em);
    right: -1.5em;

    width: 1em;
    display: inline-block;
    /* vertical-align: middle; */
    fill: var(--theme-color);

    pointer-events: none;
  }

  .results-grid .grid-content {
    display: grid;
    grid-template-rows: 1fr min-content;
  }
</style>
