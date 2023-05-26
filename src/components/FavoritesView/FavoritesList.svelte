<script lang="ts">
  import audioStreamGetter from '../../lib/audioStreamGetter';
  import { play, useSource, reset, pause } from '../../lib/AudioPlayer.svelte';
  import ActionButton from '../../lib/ActionButton.svelte';

  import {
    musicTitle,
    poster,
    artist,
    favorites,
    playNextList,
    currentID,
    ended,
    smallPoster,
  } from '../../lib/player';
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  import type { FavoriteStore } from '../../types/FavoritesStore';

  import Footer from '../Footer.svelte';
  import FavoritesItem from './FavoritesItem.svelte';
  import Modal from '../../lib/Modal.svelte';

  let resultIndex = -1;

  let autoplay = false;
  let shuffle = false;

  let playWarning = false;
  let afterWarningAction = () => {};

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
    // check if PlayNextList is empty to prevent unexpected behavior
    if ($playNextList.length !== 0) return alertPlayNext(toggleAutoplay);

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
    // check if PlayNextList is empty to prevent unexpected behavior
    if ($playNextList.length !== 0) return alertPlayNext(toggleShuffle);

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

  function alertPlayNext(fn: () => void) {
    playWarning = true;
    afterWarningAction = fn;
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
</script>

<Modal closed={!playWarning} closable={false}>
  <div slot="title">Play Next is in conflict with your action</div>
  <p>
    You're trying to play your favorites list, but Play Next is trying to play
    its own list.
    <br />
    To continue you can either clear the Play Next list or play a single song from
    your favorites list.
  </p>
  <div slot="content__bottom">
    <div class="flex-buttons">
      <ActionButton
        title="Clear Play Next"
        backgroundColor="var(--back-color)"
        scale="0.8"
        on:click={() => {
          $playNextList = [];
          playWarning = false;

          afterWarningAction();
        }}
      />
      <ActionButton
        title="Cancel"
        backgroundColor="var(--back-color)"
        scale="0.8"
        on:click={() => {
          playWarning = false;
        }}
      />
    </div>
  </div>
</Modal>

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
      {#each $favorites as favorite, id (favorite.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          animate:flip={{ duration: 300 }}
          transition:fade|local={{ duration: 180 }}
          class="result"
          class:selected={$currentID === favorite.id}
          data-id={id}
          on:click={() => wantPlay(favorite, id)}
        >
          <FavoritesItem result={favorite} {id} />
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
  .buttons {
    display: flex;
    gap: 0.5em;
  }

  /* warning modal styles */
  .flex-buttons {
    display: flex;
    flex-direction: row;
    gap: 1em;
  }
</style>
