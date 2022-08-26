<script type="ts">
  // cspell:word onpopstate onhashchange

  import Toolbar from './components/Toolbar.svelte';
  import Results from './components/Results.svelte';
  import Player from './components/Player.svelte';
  import AudioPlayer from './lib/AudioPlayer.svelte';
  import { onMount } from 'svelte';
  import { musicTitle, paused } from './lib/player';

  const DOCUMENT_ORIGINAL_TITLE = document.title;

  paused.subscribe(() => {
    if ($paused) {
      document.title = DOCUMENT_ORIGINAL_TITLE;
      return;
    }
    document.title = `${$musicTitle} | Musicale`;
  });

  let query = '';
  let toSearch = '';

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
    }
    // alert(toSearch);
  }

  function lookupHash() {
    const hash = window.location.hash.slice(1);
    if (hash && hash.startsWith('search=')) {
      query = decodeURIComponent(hash.slice('search='.length));
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
</script>

<main>
  <AudioPlayer />
  <Toolbar
    bind:query
    on:submit={submit}
    on:home={() => {
      query = '';
      submit();
    }}
  />
  <Results type={toSearch ? 'success' : 'empty'} bind:query={toSearch} />
  <Player />
</main>
