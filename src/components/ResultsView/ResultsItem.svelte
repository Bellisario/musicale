<script lang="ts">
  import { wantPlay } from '$lib/wantPlay';
  import type { Result } from '$types/Results';
  import type { FavoriteStore } from '$types/FavoritesStore';
  import urlToId from '$lib/urlToId';
  import IntersectionObserver from '$lib/IntersectionObserver.svelte';
  import { currentID, favorites, menuEntries, playNextList } from '$store';
  import { fade } from 'svelte/transition';

  import truncate from 'just-truncate';
  import loveIcon from '$assets/love.svg?raw';
  import focusable from '$lib/focuser/focusable';
  import { lazyLoad } from '$lib/lazyLoad';

  interface Props {
    result: Result;
    id: number;
  }

  let { result, id }: Props = $props();

  let resultID = urlToId(result.url);

  let hovering = $state(false);

  let loved: boolean = $derived($favorites.map((a) => a.id).includes(resultID));

  function toggleFavorite(e: MouseEvent | undefined) {
    if (e) e.preventDefault();

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

  const favoriteStore: FavoriteStore = {
    id: resultID,
    title: result.title,
    artist: result.uploaderName,
    poster: result.thumbnail,
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  in:fade|global
  class="result"
  class:selected={$currentID === urlToId(result.url)}
  data-id={id}
  onclick={() => wantPlay(favoriteStore)}
  onpointerover={() => (hovering = true)}
  onpointerout={() => (hovering = false)}
  oncontextmenu={() =>
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
  use:focusable={{ margin: 7, borderRadius: 5 }}
  tabindex="0"
>
  <div class="result__grid1" style="--img: url('{result.thumbnail}')">
    <IntersectionObserver top={150} once={true}>
      {#snippet children({ intersecting })}
        <img
          src={intersecting ? result.thumbnail : ''}
          alt={result.title}
          class="result__img"
          use:lazyLoad={true}
        />
      {/snippet}
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
          onclick={toggleFavorite}
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
    transition:
      opacity 300ms,
      transform 300ms;
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
