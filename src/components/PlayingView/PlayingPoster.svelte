<script lang="ts">
  // cspell:word keyframes xlink

  import {
    poster,
    smallPoster,
    musicTitle,
    artist,
    source,
    currentID,
    favorites,
  } from '$lib/player';
  import type { FavoriteStore } from '$types/FavoritesStore';
  import { fade } from 'svelte/transition';
  import truncate from 'just-truncate';

  // just for demo purposes
  let loving = false;

  // check if the current song is in favorites
  $: loving = $favorites.some((favorite) => favorite.id === $currentID);

  let localPoster: string;
  let posterHidden = true;

  let firstLoad = true;

  export let barsVisible: boolean;

  function revokePoster() {
    try {
      URL.revokeObjectURL(localPoster);
    } catch {
      // do nothing
    }
  }

  function favoritesToggle() {
    // loving = !loving;
    if (!loving) {
      const favorite: FavoriteStore = {
        id: $currentID,
        title: $musicTitle,
        artist: $artist,
        poster: $smallPoster,
      };
      $favorites = [favorite, ...$favorites];
    } else {
      $favorites = $favorites.filter((favorite) => favorite.id !== $currentID);
    }
  }

  function downloadSource() {
    const a = document.createElement('a');
    a.href = $source;
    a.download = `${$musicTitle}.mp4`;
    a.target = '_blank';
    a.click();
  }

  poster.subscribe(async () => {
    posterHidden = true;
    revokePoster();
    if ($poster === '') {
      return;
    }
    firstLoad = false;
    const res = await fetch($poster);
    if (!res.ok) {
      return;
    }
    const blob = await res.blob();
    localPoster = URL.createObjectURL(blob);
    posterHidden = false;
  });
</script>

<div class="playing-preview">
  <div class="preview-poster" id="preview-poster">
    {#if !posterHidden}
      <div
        transition:fade|global
        class="poster-image"
        style="background-image: url({localPoster});"
      />
    {:else if firstLoad}
      <svg class="party-icon">
        <use xlink:href="#party" />
      </svg>
    {/if}
  </div>
  <div class="first-load {firstLoad ? '' : 'hiding'}">
    Play a song to see info here
  </div>
  {#if $musicTitle !== '' && $artist !== ''}
    <div class="preview-info" transition:fade|global>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="bars-button"
        class:enabled={barsVisible}
        on:click={() => (barsVisible = !barsVisible)}
        title="{barsVisible ? 'Hide' : 'Show'} bars"
      >
        <svg class="bars-icon">
          <use xlink:href="#bars" />
        </svg>
      </div>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="download-button"
        on:click={() => downloadSource()}
        title="Download current music"
      >
        <svg class="download-icon">
          <use xlink:href="#download" />
        </svg>
      </div>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="love-button"
        class:loving
        class:disabled={$currentID === ''}
        on:click={favoritesToggle}
        title="{loving ? 'Remove from' : 'Add to'} favorites"
      >
        <svg class="love-icon">
          <use xlink:href="#love" />
        </svg>
      </div>
      <div
        class="preview-info__title"
        title={$musicTitle !== truncate($musicTitle, 55) ? $musicTitle : null}
      >
        {truncate($musicTitle, 55)}
      </div>
      <div class="preview-info__artist">{$artist}</div>
    </div>
  {/if}
  <svg style="display:none;">
    <symbol id="party" viewBox="0 0 24 24">
      <path
        d="M2.5 19.245l.816 1.506 1.684.31-1.18 1.241.225 1.698-1.545-.739-1.545.739.225-1.698-1.18-1.241 1.684-.31.816-1.506zm19.293-3.851l-.917-.326-1.946 5.471c-1.44-.856-3.521-.263-3.98 1.028-.386 1.085.276 1.953 1.211 2.286 1.11.395 2.609.035 3.183-1.574l1.471-4.135c1.42 1.766 1.881 1.979 1.617 3.305.684-.622 1.002-1.098 1.204-1.664.615-1.729-2.338-3-1.843-4.391zm-7.61-12.343l-8.13 5.493 2.849 7.266c-1.789.323-2.981 2.243-2.438 3.627.467 1.191 1.635 1.43 2.646 1.033 1.201-.47 2.18-1.837 1.502-3.571l-2.381-6.074 6.149-3.992 1.885 4.806c-1.786.323-2.98 2.238-2.439 3.618.468 1.195 1.662 1.427 2.668 1.032 1.192-.467 2.16-1.828 1.483-3.562l-3.794-9.676zm-11.683 8.005l-2.5 2.5 2.5 2.5 2.5-2.5-2.5-2.5zm18.346-8.056l1.029 1.9 2.125.392-1.489 1.566.284 2.142-1.949-.932-1.95.932.284-2.142-1.489-1.566 2.125-.392 1.03-1.9zm-12.193-2.381l-.863-.619-3.284 4.575c-1.059-1.622-3.104-2.051-4.158-.582-.651.907-.341 2.187.538 2.818 1.046.751 2.666.91 3.634-.435l4.133-5.757z"
      />
    </symbol>
    <symbol id="bars" viewBox="0 0 24 24">
      <path
        d="m13 16.745c0-.414-.336-.75-.75-.75h-9.5c-.414 0-.75.336-.75.75s.336.75.75.75h9.5c.414 0 .75-.336.75-.75zm9-5c0-.414-.336-.75-.75-.75h-18.5c-.414 0-.75.336-.75.75s.336.75.75.75h18.5c.414 0 .75-.336.75-.75zm-4-5c0-.414-.336-.75-.75-.75h-14.5c-.414 0-.75.336-.75.75s.336.75.75.75h14.5c.414 0 .75-.336.75-.75z"
        fill-rule="nonzero"
      />
    </symbol>
    <symbol id="download" viewBox="0 0 24 24">
      <path d="M16 11h5l-9 10-9-10h5v-11h8v11zm1 11h-10v2h10v-2z" />
    </symbol>
    <symbol id="love" viewBox="0 0 24 24">
      <path
        d="M19.5 10c-2.483 0-4.5 2.015-4.5 4.5s2.017 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.017-4.5-4.5-4.5zm2.5 5h-2v2h-1v-2h-2v-1h2v-2h1v2h2v1zm-6.527 4.593c-1.108 1.086-2.275 2.219-3.473 3.407-6.43-6.381-12-11.147-12-15.808 0-6.769 8.852-8.346 12-2.944 3.125-5.362 12-3.848 12 2.944 0 .746-.156 1.496-.423 2.253-1.116-.902-2.534-1.445-4.077-1.445-3.584 0-6.5 2.916-6.5 6.5 0 2.063.97 3.901 2.473 5.093z"
      />
    </symbol>
  </svg>
</div>

<style>
  .first-load {
    z-index: -1;
    margin-top: 1em;
  }
  .first-load.hiding {
    animation: first-load-hiding 250ms ease-in-out forwards;
  }
  @keyframes first-load-hiding {
    0% {
    }
    100% {
      margin-top: -1em;
      opacity: 0;
      transform: scale(0);
    }
  }
  .playing-preview {
    --content-size: 70%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: sticky;
    top: 20vh;
    transition: transform 0.5s ease-in-out;
  }
  .preview-poster {
    width: var(--content-size);
    padding-bottom: var(--content-size);
    position: relative;
    border-radius: 15px;
    overflow: hidden;
    background-color: var(--bars-color);
    box-shadow: var(--theme-shadow);
  }
  .poster-image {
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    position: absolute;
    background-size: cover;
    background-position: center;
  }
  .preview-info {
    position: relative;
    width: var(--content-size);
    padding: 0.75em 0.5em;
  }
  .preview-info__title {
    font-size: 1.25rem;
    font-weight: bold;
  }
  .party-icon {
    inset: 0;
    width: 50%;
    height: 50%;
    position: absolute;
    margin: auto;
    fill: var(--theme-color);
    opacity: 0.75;
  }
  .bars-button {
    position: absolute;
    display: flex;
    align-items: center;
    width: 2em;
    height: 2em;
    top: -2.5em;
    left: -2.5em;
    background-color: var(--bars-color);
    fill: var(--theme-color);
    border-radius: 50%;
    cursor: pointer;
    transition: background-color, opacity 0.25s ease-in-out;
  }
  .bars-icon {
    width: 2em;
    height: 1.5em;
    transform: rotate(-90deg);
    fill: var(--theme-color);
    transition: fill 0.25s ease-in-out;
  }
  .bars-button.enabled {
    background-color: var(--theme-color);
  }
  .bars-button.enabled .bars-icon {
    fill: var(--bars-color);
  }
  .bars-button:hover {
    opacity: 0.75;
  }
  .download-button {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2em;
    height: 2em;
    top: -5em;
    left: -2.5em;
    background-color: var(--bars-color);
    fill: var(--theme-color);
    border-radius: 50%;
    cursor: pointer;
    transition: opacity 0.25s ease-in-out;
  }
  .download-button:hover {
    opacity: 0.75;
  }
  .download-icon {
    width: 1.25em;
    height: 1.25em;
    transition: background-color 0.25s ease-in-out;
  }
  .love-button {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2em;
    height: 2em;
    top: -7.5em;
    left: -2.5em;
    background-color: var(--bars-color);
    fill: var(--theme-color);
    border-radius: 50%;
    cursor: pointer;
    transition: background-color, opacity 0.25s ease-in-out;
  }
  .love-button:hover {
    opacity: 0.75;
  }
  .love-button.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  .love-icon {
    width: 1.2em;
    height: 1.2em;
    transition: fill 0.25s ease-in-out;
    transform: translateY(0.08em);
  }
  .love-button.loving {
    background-color: var(--theme-color);
  }
  .love-button.loving .love-icon {
    fill: var(--bars-color);
  }
</style>
