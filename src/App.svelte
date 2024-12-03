<script lang="ts">
  // cspell:word onpopstate onhashchange

  import Toolbar from '$components/Toolbar/Toolbar.svelte';
  import Player from '$components/PlayerControls/PlayerControls.svelte';
  import SwManager from '$components/SWManager.svelte';
  import AudioPlayer from '$lib/AudioPlayer.svelte';
  import Modal from '$lib/Modal.svelte';
  import ActionButton from '$lib/ActionButton.svelte';

  import { onMount } from 'svelte';
  import {
    musicTitle,
    paused,
    query,
    favoritesActive,
    settingsActive,
    hash,
  } from '$store';

  import MainLayout from '$components/MainLayout.svelte';
  import FocusOutline from '$lib/focuser/FocusOutline.svelte';

  const DOCUMENT_ORIGINAL_TITLE = document.title;

  let loading = $state(true);
  let loadingHiding = $state(false);

  let mobileModal = $state(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  let isOnline = $derived(navigator.onLine);
  $effect(() => {
    $query = $hash.search || ''
  })

  $effect(() => {
    if ($musicTitle && !$paused) {
      document.title = `${$musicTitle} | Musicale`;
      return;
    }
    if (!$hash.search) {
      document.title = DOCUMENT_ORIGINAL_TITLE;
      return;
    }
    if ($paused) {
      document.title = `"${$hash.search}" on Musicale`;
      return;
    }
  })

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
      <img src="/logo.svg" alt="Logo" class="loading__logo" />
    </div>
  {/if}
  <!-- modal displayed on load for mobile devices -->
  <Modal closed={!mobileModal}>
    {#snippet title()}
        <div >Mobile device detected</div>
      {/snippet}
    <p>
      Musicale is not optimized for mobile devices.<br />You can still use it,
      but it's really suggested to get a computer to enjoy the full experience.
    </p>
    {#snippet content__bottom()}
        <div >
        <ActionButton
          title="Close"
          backgroundColor="var(--back-color)"
          scale="0.8"
          onclick={() => {
            mobileModal = false;
          }}
        />
      </div>
      {/snippet}
  </Modal>
  <Modal closed={isOnline}>
    {#snippet title()}
        <div >No Internet connection</div>
      {/snippet}
    <p>
      Musicale needs an Internet connection to work.<br />Please check your
      connection and try again.
    </p>
    {#snippet content__bottom_small()}
        <div >
        This popup will automatically disappear as soon as the connection is back
        again.
      </div>
      {/snippet}
  </Modal>
  <SwManager />
  <AudioPlayer />
  <Toolbar
    onHome={() => {
      hash.set({});

      $favoritesActive = false;
      $settingsActive = false;
    }}
  />
  <MainLayout />
  <Player />
  <FocusOutline />
</main>

<style>
  .hiding {
    opacity: 0;
  }
</style>
