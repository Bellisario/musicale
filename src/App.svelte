<script type="ts">
  // cspell:word onpopstate onhashchange

  import Toolbar from './components/Toolbar.svelte';
  import Player from './components/Player.svelte';
  import SwManager from './components/SWManager.svelte';
  import AudioPlayer from './lib/AudioPlayer.svelte';

  import { onMount } from 'svelte';
  import {
    musicTitle,
    paused,
    query,
    toSearch,
    favoritesActive,
  } from './lib/player';

  import MainLayout from './components/MainLayout.svelte';

  const DOCUMENT_ORIGINAL_TITLE = document.title;

  paused.subscribe(() => {
    if ($paused) {
      document.title = DOCUMENT_ORIGINAL_TITLE;
      return;
    }
    document.title = `${$musicTitle} | Musicale`;
  });

  let inputFocus = true;

  let loading = true;
  let loadingHiding = false;

  function submit(firstLoad = false) {
    if ($query.trim() !== '') {
      location.hash = '#search=' + $query;
      if ($paused) {
        document.title = `"${$query}" on Musicale`;
      }
      $toSearch = $query;
      if (!firstLoad) {
        $favoritesActive = false;
      }
    } else {
      location.hash = '';
      if ($paused) {
        document.title = DOCUMENT_ORIGINAL_TITLE;
      }
    }
  }

  function getParameters() {
    const hash = location.hash;
    try {
      const params = new URLSearchParams(hash.slice(1));
      const search = params.get('search');
      return { search };
    } catch {
      return { search: '' };
    }
  }

  function lookupHash(firstLoad = false) {
    const { search } = getParameters();
    if (search !== null) {
      $query = decodeURIComponent(search);
      inputFocus = false;
    } else {
      $query = '';
    }
    submit(firstLoad);
  }

  onMount(() => {
    lookupHash(true);
  });
  window.onpopstate = () => {
    lookupHash();
  };
  window.onhashchange = () => {
    lookupHash();
  };

  onMount(() => {
    (
      document.querySelector('.loading-screen') as HTMLDivElement
    ).style.display = 'none';
  });

  // loading hide
  setTimeout(() => {
    loadingHiding = true;
  }, 500);
  setTimeout(() => {
    loading = false;
  }, 1000);
</script>

<main>
  {#if loading}
    <div class="loading-screen" class:hiding={loadingHiding}>
      <img src="/logo.svg" alt="Logo" class="loading__logo">
    </div>
  {/if}
  <SwManager />
  <AudioPlayer />
  <Toolbar
    bind:inputFocus
    on:submit={() => submit()}
    on:home={() => {
      $query = '';
      $toSearch = '';
      $favoritesActive = false;
      submit();
    }}
  />
  <MainLayout />
  <Player />
</main>

<style>
  .hiding {
    opacity: 0;
  }
</style>
