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
    menuEntries,
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

  let currentItem: HTMLDivElement;
  let draggingThis = false;
  let draggingOverThis = false;
  let draggingPosition: 'before' | 'after' | null;

  function resetDragging() {
    draggingOverThis = false;
    draggingPosition = null;
  }
  function onDragStart(e: DragEvent) {
    e.dataTransfer.setData('application/musicale-favorite', result.id);
    e.dataTransfer.effectAllowed = 'move';

    draggingThis = true;
  }
  function onDragEnd(e: DragEvent) {
    draggingThis = false;
    resetDragging();
  }
  function onDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // calculate the y position of the mouse
    const y = e.clientY - currentItem.getBoundingClientRect().top;
    // check if the mouse is in the upper half or lower half of the item
    const isAfterHalf = y > currentItem.offsetHeight / 2;
    // set the dragging position
    draggingPosition = isAfterHalf ? 'after' : 'before';
  }
  function onDrop(e: DragEvent) {
    e.preventDefault();

    const data = e.dataTransfer.getData('application/musicale-favorite');

    const movingItem = $favorites.find((f) => f.id === data);

    if (result.id == movingItem.id) {
      resetDragging();
      return;
    }

    // remove the item from the array
    $favorites = $favorites.filter((f) => f.id !== data);

    const targetItemIndex = $favorites.findIndex((f) => f.id === result.id);

    // add the item to the array
    $favorites = [
      ...$favorites.slice(
        0,
        targetItemIndex + (draggingPosition === 'after' ? 1 : 0)
      ),
      movingItem,
      ...$favorites.slice(
        targetItemIndex + (draggingPosition === 'after' ? 1 : 0)
      ),
    ];

    resetDragging();
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  in:fade
  class="result {draggingPosition ? 'dragging-' + draggingPosition : ''}"
  class:dragging={draggingThis}
  class:selected={$currentID === result.id}
  data-id={id}
  on:click={() => wantPlay(result, id)}
  on:pointerover={() => (hovering = true)}
  on:pointerout={() => (hovering = false)}
  draggable="true"
  on:dragstart={onDragStart}
  on:dragend={onDragEnd}
  on:dragover={onDragOver}
  on:dragenter={onDragOver}
  on:dragleave={resetDragging}
  on:drop={onDrop}
  bind:this={currentItem}

  on:contextmenu={() =>
    ($menuEntries = [
      {
        title: 'Play',
        disabled: $currentID === result.id,
        action: () => wantPlay(result, id),
      },
      {
        title: 'Remove from favorites',
        action: () => $favorites = $favorites.filter((a) => a.id !== resultID),
      },
    ])}
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

    position: relative;
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

  .result.dragging {
    opacity: 0.5;
  }

  .result::before,
  .result::after {
    content: '';
    position: absolute;
    left: 0;
    width: 20em;
    height: 0.1em;
    background-color: var(--theme-color);
    opacity: 0;

    --el-padding: 0.5em;
  }
  .result.dragging-before::before {
    top: calc(-0.1em - var(--el-padding));
    opacity: 1;
  }
  .result.dragging-after::after {
    bottom: calc(-0.1em - var(--el-padding));
    opacity: 1;
  }
</style>
