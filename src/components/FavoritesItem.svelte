<script lang="ts">
  import type { FavoriteStore } from 'src/types/FavoritesStore';
  import audioStreamGetter from '../lib/audioStreamGetter';
  import { play, useSource, reset } from '../lib/AudioPlayer.svelte';
  import IntersectionObserver from '../lib/IntersectionObserver.svelte';
  import {
    musicTitle,
    poster,
    artist,
    currentID,
    smallPoster,
    favorites,
  } from '../lib/player';
  import { fade } from 'svelte/transition';

  import truncate from 'just-truncate';
  import binIcon from '../assets/bin.svg?raw';

  export let result: FavoriteStore;
  export let id: number;

  let resultID = result.id;

  let selectedResult = {
    id: -1,
    uuid: '',
  };

  let canReplaySong = true;
  let hovering = false;

  let removing = false;
  let removingCancelTimeout: NodeJS.Timeout;

  async function wantPlay(result: FavoriteStore, selectedId: number) {
    // reset currentID while fetching
    $currentID = '';

    const id = result.id;

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
    $smallPoster = result.poster;
    $artist = result.artist;

    const streamUrl = apiRes.audioStreams.filter(
      (stream) => stream.mimeType === 'audio/mp4'
    )[0].url;
    console.log(streamUrl);
    useSource(streamUrl);
    play();
    canReplaySong = true;
    $currentID = id;
  }

  const lazyLoad = (el: HTMLDivElement) => {
    el.onload = () => {
      el.style.opacity = '1';
    };
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  in:fade
  class="result"
  class:selected={$currentID === result.id}
  data-id={id}
  on:click={() => wantPlay(result, id)}
  on:pointerover={() => (hovering = true)}
  on:pointerout={() => (hovering = false)}
>
  <div class="result__grid1" style="--img: url('{result.poster}')">
    <IntersectionObserver let:intersecting top={150} once={true}>
      <img
        src={intersecting ? result.poster : ''}
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
      {#if hovering || removing}
        <div
          class="result__remove"
          transition:fade|local
          on:click|stopPropagation={() => {
            clearTimeout(removingCancelTimeout);
            if (removing)
              $favorites = $favorites.filter((a) => a.id !== resultID);
            else {
              removing = true;
              removingCancelTimeout = setTimeout(() => {
                removing = false;
              }, 3000);
            }
          }}
        >
          <div class="remove__icon" title="Remove from favorites">
            {@html binIcon}
          </div>
          {#if removing}
            <span class="remove__warning" transition:fade|local>Sure?</span>
          {/if}
        </div>
      {/if}
    </div>
    <p>{result.artist}</p>
  </div>
</div>

<style>
  img {
    user-select: none;
    pointer-events: none;
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
  .result__remove {
    position: absolute;
    top: calc(50% - 0.5em);
    left: calc(100% + 0.5em);
    width: max-content;

    transition: fill 200ms ease-in;
  }
  .remove__icon {
    width: 1em;
    display: inline-block;
    /* vertical-align: middle; */
    fill: var(--theme-color);
  }
  .remove__warning {
    vertical-align: top;
    font-size: 0.85em;
  }

  /* keep hoovering while transitioning from title to remove button (fills a little "gap") */
  .result__title::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0.5em;

    /* debug color */
    /* background-color: rgba(255, 0, 0, 0.3); */
  }
</style>
