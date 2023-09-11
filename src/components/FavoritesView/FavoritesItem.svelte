<script lang="ts">
  import type { FavoriteStore } from '$types/FavoritesStore';
  import IntersectionObserver from '$lib/IntersectionObserver.svelte';
  import { currentID, favorites, menuEntries, playNextList } from '$lib/player';
  import { wantPlay } from '$lib/wantPlay';

  import { fade } from 'svelte/transition';

  import truncate from 'just-truncate';
  import binIcon from '$assets/bin.svg?raw';

  export let item: FavoriteStore;
  export let dragEl: boolean = false;

  let hovering = false;

  let removing = false;
  let removingCancelTimeout: NodeJS.Timeout;

  const lazyLoad = (el: HTMLDivElement) => {
    el.onload = () => {
      el.classList.add('loaded');
    };
  };

  let currentItem: HTMLDivElement;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  in:fade|global
  class="result"
  class:selected={$currentID === item.id}
  on:click={() => wantPlay(item)}
  on:pointerover={() => (hovering = true)}
  on:pointerout={() => (hovering = false)}
  bind:this={currentItem}
  on:contextmenu={() =>
    ($menuEntries = [
      {
        title: 'Play',
        disabled: $currentID === item.id,
        action: () => wantPlay(item),
      },
      {
        title: 'Play Next',
        disabled:
          $currentID === item.id ||
          $playNextList.map((a) => a.id).includes(item.id) ||
          $currentID === '',
        action: () => ($playNextList = [...$playNextList, item]),
        breakAfter: true,
      },
      {
        title: 'Remove from favorites',
        action: () => ($favorites = $favorites.filter((a) => a.id !== item.id)),
      },
    ])}
>
  <div class="result__grid1" style="--img: url('{item.poster}')">
    {#if !dragEl}
      <IntersectionObserver let:intersecting top={150} once={true}>
        <img
          src={intersecting ? item.poster : ''}
          alt={item.title}
          class="result__img"
          use:lazyLoad
        />
      </IntersectionObserver>
    {:else}
      <img src={item.poster} alt={item.title} class="result__img loaded" />
    {/if}
  </div>
  <div class="result__grid2">
    <div class="result__title">
      <h2 title={item.title !== truncate(item.title, 40) ? item.title : null}>
        {truncate(item.title, 40)}
      </h2>
      {#if hovering || removing}
        <div
          class="result__remove"
          transition:fade
          on:click|stopPropagation={() => {
            clearTimeout(removingCancelTimeout);
            if (removing)
              $favorites = $favorites.filter((a) => a.id !== item.id);
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
            <span class="remove__warning" transition:fade>Sure?</span>
          {/if}
        </div>
      {/if}
    </div>
    <p>{item.artist}</p>
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

    object-fit: cover;
    object-position: center;

    opacity: 0;
    transition: opacity 0.5s ease-in;
  }
  .result__img.loaded {
    opacity: 1;
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
