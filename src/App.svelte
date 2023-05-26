<script lang="ts">
  // cspell:word onpopstate onhashchange

  import Toolbar from './components/Toolbar/Toolbar.svelte';
  import Player from './components/PlayerControls/PlayerControls.svelte';
  import SwManager from './components/SWManager.svelte';
  import AudioPlayer from './lib/AudioPlayer.svelte';
  import Modal from './lib/Modal.svelte';
  import ActionButton from './lib/ActionButton.svelte';

  import { onMount } from 'svelte';
  import {
    musicTitle,
    paused,
    query,
    toSearch,
    favoritesActive,
    settingsActive,
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

  let mobileModal = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  let isOnline = navigator.onLine;
  $: isOnline = navigator.onLine;

  function submit(firstLoad = false) {
    if ($query.trim() !== '') {
      location.hash = '#search=' + $query;
      if ($paused) {
        document.title = `"${$query}" on Musicale`;
      }
      $toSearch = $query;
      if (!firstLoad) {
        $favoritesActive = false;
        $settingsActive = false;
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

<svelte:window
  on:online={() => (isOnline = true)}
  on:offline={() => (isOnline = false)}
/>

<main>
  {#if loading}
    <div class="loading-screen" class:hiding={loadingHiding}>
      <img src="/logo.svg" alt="Logo" class="loading__logo" />
    </div>
  {/if}
  <!-- modal displayed on load for mobile devices -->
  <Modal closed={!mobileModal}>
    <div slot="title">Mobile device detected</div>
    <p>
      Musicale is not optimized for mobile devices.<br />You can still use it,
      but it's really suggested to get a computer to enjoy the full experience.
    </p>
    <div slot="content__bottom">
      <ActionButton
        title="Close"
        backgroundColor="var(--back-color)"
        scale="0.8"
        on:click={() => {
          mobileModal = false;
        }}
      />
    </div>
  </Modal>
  <Modal closed={isOnline}>
    <div slot="title">No Internet connection</div>
    <p>
      Musicale needs an Internet connection to work.<br />Please check your
      connection and try again.
    </p>
    <div slot="content__bottom_small">
      This popup will automatically disappear as soon as the connection is back
      again.
    </div>
  </Modal>
  <SwManager />
  <AudioPlayer />
  <Toolbar
    bind:inputFocus
    on:submit={() => submit()}
    on:home={() => {
      $query = '';
      $toSearch = '';
      $favoritesActive = false;
      $settingsActive = false;
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
