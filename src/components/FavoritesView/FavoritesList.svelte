<script lang="ts">
  import ActionButton from '$lib/ActionButton.svelte';

  import {
    favorites,
    playNextList,
    currentID,
    favoritesPlayStatus,
    shuffle,
  } from '$lib/player';
  import { fade } from 'svelte/transition';

  import type { FavoriteStore } from '$types/FavoritesStore';

  import Footer from '../Footer.svelte';
  import FavoritesItem from './FavoritesItem.svelte';
  import Modal from '$lib/Modal.svelte';
  import Orderable from '$lib/Orderable.svelte';

  let playWarning = false;
  let warningAction = () => {};

  function playAll(results: FavoriteStore[]) {
    results.forEach((result) => {
      // find if the song is already in the playNextList
      const found = $playNextList.find((a) => a.id === result.id);

      if (found) return;

      // if it's not, add it
      $playNextList = [...$playNextList, result];
    });
  }
  function playShuffleAll(results: FavoriteStore[]) {
    const shuffledResults = shuffle(results);

    shuffledResults.forEach((result) => {
      // find if the song is already in the playNextList
      const found = $playNextList.find((a) => a.id === result.id);

      if (found) return;

      // if it's not, add it
      $playNextList = [...$playNextList, result];
    });
  }

  async function togglePlayAll() {
    if ($favoritesPlayStatus !== -1) {
      playWarning = true;
      warningAction = () => togglePlayAll();
      return;
    }

    playAll($favorites);

    $favoritesPlayStatus = 0;
  }
  async function toggleShuffle() {
    if ($favoritesPlayStatus !== -1) {
      playWarning = true;
      warningAction = () => toggleShuffle();
      return;
    }

    playShuffleAll($favorites);

    $favoritesPlayStatus = 1;
  }
</script>

<Modal closed={!playWarning} closable={false}>
  <div slot="title">Favorites are already on Play Next</div>
  <p>
    You're trying to play your favorites list, but they're already on the Play
    Next list.
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
          $currentID = '';
          playWarning = false;
          $favoritesPlayStatus = -1;
          warningAction();
        }}
      />
      <ActionButton
        title="Cancel"
        backgroundColor="var(--back-color)"
        scale="0.8"
        on:click={() => (playWarning = false)}
      />
    </div>
  </div>
</Modal>

<div class="container">
  <div class="results-grid" class:align-center={$favorites.length !== 0}>
    {#if $favorites.length === 0}
      <div class="default grid-content" in:fade|global>
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
          on:click={togglePlayAll}
          active={$favoritesPlayStatus === 0}
        />
        <ActionButton
          title="Shuffle"
          on:click={toggleShuffle}
          active={$favoritesPlayStatus === 1}
        />
      </div>
      <Orderable
        class="list"
        bind:itemsData={$favorites}
        Item={FavoritesItem}
        dataType="favorites"
        gap="1rem"
      />
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
    padding: 2em;
    min-height: calc(100vh - var(--bars-height) * 2);
    /* prevent bottom content from staying under the bars */
    margin-bottom: var(--bars-height);
  }
  .buttons {
    margin-top: 0.75em;
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
