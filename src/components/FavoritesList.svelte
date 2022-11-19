<script type="ts">
  // cspell:word autoplay
  import audioStreamGetter from '../lib/audioStreamGetter';
  import { play, useSource, reset, pause } from '../lib/AudioPlayer.svelte';
  import IntersectionObserver from '../lib/IntersectionObserver.svelte';
  import ActionButton from '../lib/ActionButton.svelte';

  import {
    musicTitle,
    poster,
    artist,
    favorites,
    currentID,
    ended,
    smallPoster,
  } from '../lib/player';
  import { fade } from 'svelte/transition';

  import type { FavoriteStore } from '../types/FavoritesStore';

  import truncate from 'just-truncate';

  import Footer from './Footer.svelte';

  let resultIndex = -1;

  let autoplay = false;
  let shuffle = false;

  ended.subscribe((value) => {
    if (!value || resultIndex === -1 || $favorites.length === 0) return;

    if (autoplay) {
      resultIndex++;
      if (resultIndex >= $favorites.length) resultIndex = 0;
      wantPlay($favorites[resultIndex], resultIndex);
      return;
    }
    if (shuffle) {
      shufflePlay();
      return;
    }
  });

  function toggleAutoplay() {
    autoplay = !autoplay;
    if (autoplay) {
      // reset shuffle
      shuffle = false;
      if (resultIndex === -1) resultIndex = 0;
      wantPlay($favorites[resultIndex], resultIndex);
      return;
    }
    // pause if play button is pressed
    pause();
  }

  let shuffleFavorites: number[] = [];
  let lastShuffleIndex = -1;

  function toggleShuffle() {
    shuffle = !shuffle;
    if (shuffle) {
      shuffleFavorites = getShuffle();
      // reset autoplay
      autoplay = false;
      shufflePlay();
      return;
    }
    // pause if play button is pressed
    pause();
  }

  function getShuffle(): number[] {
    // prevent unexpected behavior with 1 item
    if ($favorites.length === 1) return [0];

    // fill array with favorites indexes
    let arr = [];
    for (let i = 0; i < $favorites.length; i++) {
      arr.push(i);
    }

    // randomly shuffle the array
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // invalidate shuffle if first item is the same as the last
    if (lastShuffleIndex === arr[0]) return getShuffle();

    lastShuffleIndex = arr[arr.length - 1];

    return arr;
  }
  function shufflePlay() {
    // if empty, re-roll
    if (shuffleFavorites.length === 0) shuffleFavorites = getShuffle();

    let i = shuffleFavorites.shift();

    wantPlay($favorites[i], i);
  }

  let selectedResult = {
    id: -1,
    uuid: '',
  };

  let canReplaySong = true;

  function scrollWithSpace(el: Element) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function wantPlay(result: FavoriteStore, selectedId: number) {
    // scroll to the selected music
    setTimeout(() => {
      const el = document.querySelector(`.result[data-id="${selectedId}"]`);
      if (el) scrollWithSpace(el);
    }, 100);

    $currentID = result.id;
    resultIndex = selectedId;
    $musicTitle = result.title;

    const currentResult = {
      id: selectedId,
      uuid: result.id,
    };

    // prevent song replay if clicks on the same song again before loading
    if (selectedResult.uuid === currentResult.uuid && !canReplaySong) {
      return;
    }
    canReplaySong = false;

    selectedResult = currentResult;
    // reset the current audio stream
    reset();
    const apiRes = await audioStreamGetter(result.id);

    $poster = apiRes.thumbnailUrl;
    $smallPoster = result.poster;
    $artist = result.artist;

    const streamUrl = apiRes.audioStreams.filter(
      (stream) => stream.mimeType === 'audio/mp4'
    )[0].url;
    console.log(streamUrl);
    useSource(streamUrl);
    play();
    canReplaySong = true;
  }

  const lazyLoad = (el: HTMLDivElement) => {
    el.onload = () => {
      el.style.opacity = '1';
    };
  };
</script>

<div class="container">
  <div class="results-grid" class:align-center={$favorites.length !== 0}>
    {#if $favorites.length === 0}
      <div class="default grid-content" in:fade>
        <div class="texts">
          <h1>No favorite music</h1>
          <p>Mark a music as favorite to have it here.</p>
        </div>
        <Footer size="small" />
      </div>
    {:else}
      <div class="title">Favorites</div>
      <div class="buttons">
        <ActionButton
          title="Play"
          on:click={toggleAutoplay}
          active={autoplay}
        />
        <ActionButton
          title="Shuffle"
          on:click={toggleShuffle}
          active={shuffle}
        />
      </div>
      {#each $favorites as favorite, id}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          in:fade
          class="result"
          class:selected={$currentID === favorite.id}
          data-id={id}
          on:click={() => wantPlay(favorite, id)}
        >
          <div class="result__grid1" style="--img: url('{favorite.poster}')">
            <IntersectionObserver let:intersecting top={150} once={true}>
              <img
                src={intersecting ? favorite.poster : ''}
                alt={favorite.title}
                class="result__img"
                use:lazyLoad
              />
            </IntersectionObserver>
          </div>
          <div class="result__grid2">
            <h2
              title={favorite.title !== truncate(favorite.title, 40)
                ? favorite.title
                : null}
            >
              {truncate(favorite.title, 40)}
            </h2>
            <p>{favorite.artist}</p>
          </div>
        </div>
      {/each}
      <Footer size="small" />
    {/if}
  </div>
</div>

<style>
  .title {
    font-size: var(--fs-biggest);
    font-weight: 700;
  }
  img {
    user-select: none;
    pointer-events: none;
  }
  .container {
    scroll-margin-top: calc(var(--bars-height) + 2rem);
  }
  .results-grid {
    display: grid;
    gap: 1em;
    padding: 2em;
    min-height: calc(100vh - var(--bars-height) * 2);
  }
  .results-grid.align-center {
    align-content: center;
  }
  .results-grid .grid-content {
    display: grid;
    grid-template-rows: 1fr min-content;
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
  .buttons {
    display: flex;
    gap: 0.5em;
  }
  .result__grid2 > h2 {
    overflow: hidden;
    position: relative;
    /* prevent text overflow by allowing a little more space */
    width: calc(100% + 0.1em);
  }
  .result__grid2 > h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 0.1rem;
    background-color: var(--theme-color);
    opacity: 0;
    transition: opacity 300ms, transform 300ms;
  }
  .result.selected .result__grid2 > h2::after {
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
</style>
