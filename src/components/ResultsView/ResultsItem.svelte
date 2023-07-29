<script lang="ts">
  import { wantPlay } from '$lib/wantPlay';
  import type { Result } from '$types/Results';
  import type { FavoriteStore } from '$types/FavoritesStore';
  import urlToId from '$lib/urlToId';
  import IntersectionObserver from '$lib/IntersectionObserver.svelte';
  import { currentID, favorites, menuEntries, playNextList } from '$lib/player';
  import { fade } from 'svelte/transition';

  import truncate from 'just-truncate';
  import loveIcon from '$assets/love.svg?raw';

  export let result: Result;
  export let id: number;

  let resultID = urlToId(result.url);

  let hovering = false;

  let loved: boolean;

  $: loved = $favorites.map((a) => a.id).includes(resultID);

  function toggleFavorite() {
    if (loved) $favorites = $favorites.filter((a) => a.id !== resultID);
    else
      $favorites = [
        {
          id: resultID,
          title: result.title,
          artist: result.uploaderName,
          poster: result.thumbnail,
        },
        ...$favorites,
      ];
  }

  const lazyLoad = (el: HTMLDivElement) => {
    el.onload = () => {
      el.style.opacity = '1';
    };
  };

  const favoriteStore: FavoriteStore = {
    id: resultID,
    title: result.title,
    artist: result.uploaderName,
    poster: result.thumbnail,
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  in:fade|global
  class="result"
  class:selected={$currentID === urlToId(result.url)}
  data-id={id}
  on:click={() => wantPlay(favoriteStore)}
  on:pointerover={() => (hovering = true)}
  on:pointerout={() => (hovering = false)}
  on:contextmenu={() =>
    ($menuEntries = [
      {
        title: 'Play',
        disabled: $currentID === urlToId(result.url),
        action: () => wantPlay(favoriteStore),
      },
      {
        title: 'Play Next',
        disabled:
          $currentID === urlToId(result.url) ||
          $playNextList.map((a) => a.id).includes(resultID) ||
          $currentID === '',
        action: () =>
          ($playNextList = [
            ...$playNextList,
            {
              id: resultID,
              title: result.title,
              artist: result.uploaderName,
              poster: result.thumbnail,
            },
          ]),
        breakAfter: true,
      },
      {
        title: `${loved ? 'Remove from' : 'Add to'} favorites`,
        action: toggleFavorite,
      },
    ])}
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
      {#if hovering || loved}
        <div
          class="result__loved"
          class:loved
          transition:fade
          on:click|stopPropagation={toggleFavorite}
        >
          {@html loveIcon}
        </div>
      {/if}
    </div>
    <p>{result.uploaderName}</p>
  </div>
</div>

<style>
  img {
    user-select: none;
    pointer-events: none;

    object-fit: cover;
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

    object-fit: cover;
    object-position: center;

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
    fill: transparent;
    stroke: var(--theme-color);
    stroke-width: 2;

    transition: fill 200ms ease-in;
  }

  /* keep hoovering while transitioning from title to love button (fills a little "gap") */
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
  .result__loved.loved {
    fill: var(--theme-color);
  }
</style>
