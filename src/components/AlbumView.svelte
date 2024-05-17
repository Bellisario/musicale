<script lang="ts">
  import type { Album } from '$types/Album';
  import { fade } from 'svelte/transition';
  import Footer from './Footer.svelte';
  import ResultsItem from './ResultsView/ResultsItem.svelte';
  import { playNextList, ended, albumsAddedToPlayNext, shuffle } from '$lib/player';
  import ActionButton from '$lib/ActionButton.svelte';
  import type { Result } from '$types/Results';
  import urlToId from '$lib/urlToId';

  export let id: string;

  async function fetchPlaylist(id: string): Promise<Album> {
    // fetch https://pipedapi.kavin.rocks/playlists/:id
    const res = await fetch(`https://pipedapi.kavin.rocks/playlists/${id}`);

    if (!res.ok) throw new Error('Failed to fetch playlist');

    const data = await res.json();

    return data;
  }
  function playAll(results: Result[]) {
    if ($albumsAddedToPlayNext[id] !== undefined) return;

    $playNextList = [
      ...$playNextList,
      ...results.map((result) => {
        return {
          id: urlToId(result.url),
          title: result.title,
          artist: result.uploaderName,
          poster: result.thumbnail,
        };
      }),
    ];

    $albumsAddedToPlayNext = {
      ...$albumsAddedToPlayNext,
      [id]: 0,
    };
  }
  function playShuffleAll(results: Result[]) {
    if ($albumsAddedToPlayNext[id] !== undefined) return;

    $playNextList = [
      ...$playNextList,
      ...shuffle(results).map((result) => {
        return {
          id: urlToId(result.url),
          title: result.title,
          artist: result.uploaderName,
          poster: result.thumbnail,
        };
      }),
    ];

    $albumsAddedToPlayNext = {
      ...$albumsAddedToPlayNext,
      [id]: 1,
    };
  }

  const lazyLoad = (el: HTMLDivElement) => {
    el.onload = () => {
      el.style.opacity = '1';
    };
  };
</script>

<div class="container">
  <div class="content">
    {#await fetchPlaylist(id)}
      <div in:fade|global={{ delay: 1000 }} class="loading">
        Loading... <span in:fade|global={{ delay: 4000 }}
          >this seems to take some more time...</span
        ><br /><span in:fade|global={{ delay: 7000 }}
          >Maybe there is a problem with API? Anyway no error for now. Working
          on...</span
        >
      </div>
    {:then album}
      <div class="album" in:fade|global>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="back-button" on:click={() => window.history.back()}>
          <svg class="back__icon">
            <use xlink:href="#back" />
          </svg>
        </div>
        <div class="img-container">
          <img
            src={album.thumbnailUrl}
            alt={album.name}
            class="result__img"
            use:lazyLoad
          />
        </div>
        <div class="info-container">
          <div class="text">
            <h1 class="title">{album.name}</h1>
            <!--
              TWEAK: album uploader seems to be always null
              using uploaderName from first stream as fallback
            -->
            <div class="author">
              {album.uploader || album.relatedStreams[0].uploaderName}
            </div>
          </div>
          <div class="buttons">
            <ActionButton
              title="Play All"
              on:click={() => playAll(album.relatedStreams)}
              active={$albumsAddedToPlayNext[id] === 0}
              disabled={$albumsAddedToPlayNext[id] === 1}
              scale="0.9"
            />
            <ActionButton
              title="Shuffle"
              on:click={() => playShuffleAll(album.relatedStreams)}
              active={$albumsAddedToPlayNext[id] === 1}
              disabled={$albumsAddedToPlayNext[id] === 0}
              scale="0.9"
            />
          </div>
        </div>
      </div>
      <div class="results">
        {#each album.relatedStreams as result, id}
          <ResultsItem {result} {id} />
        {/each}
      </div>
    {:catch error}
      <div class="message" in:fade|global>
        <div class="texts">
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
        </div>
      </div>
    {/await}
  </div>
  <Footer />
  <svg style="display:none;">
    <symbol id="back" viewBox="0 0 24 24">
      <path
        d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z"
      />
    </symbol>
  </svg>
</div>

<style>
  .container {
    --padding: 2em;

    padding: var(--padding);

    min-height: calc(100vh - var(--bars-height) * 2);

    position: relative;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* prevent bottom content from staying under the bars */
    margin-bottom: var(--bars-height);
  }

  .img-container {
    position: relative;
    width: 10rem;
    height: 10rem;
    aspect-ratio: 1;
    border-radius: 0.5rem;

    background-color: var(--bars-color);
    box-shadow: var(--theme-shadow);
  }
  img {
    user-select: none;
    pointer-events: none;

    object-fit: cover;
    width: 100%;
    transform-origin: center;

    opacity: 0;
    transition: opacity 0.5s ease-in;

    border-radius: 0.5rem;
  }

  .album {
    display: flex;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    margin-block: 2rem;

    position: relative;
  }
  .back-button {
    --size: 2.5rem;
    --padding: 1rem;

    position: absolute;
    left: calc(var(--size) * -1 - var(--padding));

    width: var(--size);
    height: var(--size);

    background-color: var(--bars-color);
    border-radius: 50%;

    cursor: pointer;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  .back__icon {
    width: 1rem;
    height: 1rem;
    fill: var(--theme-color);
  }

  .results {
    display: grid;
    gap: 1rem;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
  }

  .info-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    margin-block: 1.5rem;
  }
</style>
