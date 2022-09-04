<script type="ts">
  // cspell:word onpopstate onhashchange

  import Toolbar from './components/Toolbar.svelte';
  import Results from './components/Results.svelte';
  import Player from './components/Player.svelte';
  import SwManager from './components/SWManager.svelte';
  import AudioPlayer from './lib/AudioPlayer.svelte';

  import { onMount } from 'svelte';
  import { musicTitle, paused } from './lib/player';

  import { send } from './lib/crossFade';
  import { fade } from 'svelte/transition';

  const DOCUMENT_ORIGINAL_TITLE = document.title;

  paused.subscribe(() => {
    if ($paused) {
      document.title = DOCUMENT_ORIGINAL_TITLE;
      return;
    }
    document.title = `${$musicTitle} | Musicale`;
  });

  let query = '';
  let inputFocus = true;
  let toSearch = '';

  let loading = true;

  // function resultSelect() {
  //   audioInterface.source = this.dataset.source;
  //   audioInterface.play();
  // }

  function submit() {
    toSearch = query;
    if (query.trim() !== '') {
      location.hash = '#search=' + query;
      if ($paused) {
        document.title = `"${query}" on Musicale`;
      }
    } else {
      location.hash = '';
      if ($paused) {
        document.title = DOCUMENT_ORIGINAL_TITLE;
      }
    }
    // alert(toSearch);
  }

  function lookupHash() {
    const hash = window.location.hash.slice(1);
    if (hash && hash.startsWith('search=')) {
      query = decodeURIComponent(hash.slice('search='.length));
      inputFocus = false;
    } else {
      query = '';
    }
    submit();
  }

  onMount(() => {
    lookupHash();
  });
  window.onpopstate = () => {
    lookupHash();
  };
  window.onhashchange = () => {
    lookupHash();
  };

  onMount(() => {
    (document.querySelector('.loading-screen') as HTMLDivElement).style.display = 'none';
  }),

  // loading hide
  setTimeout(() => {
    loading = false;
  }, 1000);
</script>

<main>
  {#if loading}
    <div class="loading-screen" out:fade><span>Musicale</span></div>
  {:else}
    <SwManager />
    <AudioPlayer />
    <Toolbar
      bind:query
      bind:inputFocus
      on:submit={submit}
      on:home={() => {
        query = '';
        submit();
      }}
    />
    <Results type={toSearch ? 'success' : 'empty'} bind:query={toSearch} />
    <Player />
  {/if}
</main>
