<script type="ts">
  // cspell:word instanceof keydown onfocus onblur xlink
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import Autocomplete from './Autocomplete.svelte';

  import { receive } from '../lib/crossFade';

  import { favoritesActive, query } from '../lib/player';

  import Logo from '../assets/logo.svg?raw';

  const dispatch = createEventDispatcher();

  let search: HTMLInputElement;
  let searchFocus = false;

  function submit() {
    blur();
    dispatch('submit');
  }

  function blur() {
    try {
      search.blur();
    } catch {
      onMount(() => search.blur());
    }
    search.blur();
  }

  export let inputFocus: boolean;

  $: inputFocus === false && blur();

  let isSmall = false;

  function isTouch() {
    return window.matchMedia('(any-hover: none)').matches;
  }

  // allow small toolbar only on non-touch devices
  if (!isTouch()) {
    document.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        isSmall = true;
      } else {
        isSmall = false;
      }
    });
  }

  // focus on "/" key press and after loading
  onMount(() => {
    search.focus();
    search.onfocus = () => {
      searchFocus = true;
    };
    search.onblur = () => {
      searchFocus = false;
    };
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement === document.body) {
        e.preventDefault();
        search.focus();
        search.select();
      }
    });
  });

  function heroClick() {
    dispatch('home');
  }
</script>

<div class="toolbar {isSmall ? 'toolbar__small' : ''}">
  <div class="toolbar__left">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="toolbar__hero"
      on:click={heroClick}
      transition:receive={{ key: 'loading-screen', duration: 1000 }}
    >
    <div class="hero__img">
      {@html Logo}
    </div>
    </div>
  </div>
  <div class="toolbar__right">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="toolbar__favorites"
      on:click={() => ($favoritesActive = !$favoritesActive)}
      class:active={$favoritesActive}
      title="{$favoritesActive ? 'Close' : 'Open'} favorites"
    >
      <svg class="favorites__icon">
        <use xlink:href="#favorites" />
      </svg>
    </div>
    <form class="toolbar__search" on:submit|preventDefault={submit}>
      <input
        type="text"
        placeholder="Search"
        bind:value={$query}
        bind:this={search}
      />
      <Autocomplete bind:query={$query} on:submit={submit} bind:searchFocus />
    </form>
  </div>
  <svg style="display:none;">
    <symbol id="favorites" viewBox="0 0 24 24">
      <path
        d="M12 21h-12v-2h12v2zm4-9l8-1v6.681c-.002 1.555-1.18 2.319-2.257 2.319-.907 0-1.743-.542-1.743-1.61 0-.96.903-1.852 2-2.073v-2.317l-4 .5v4.181c-.002 1.555-1.18 2.319-2.257 2.319-.907 0-1.743-.542-1.743-1.61 0-.96.903-1.852 2-2.073v-5.317zm-4 4.976h-12v-2h12v2zm0-3.976h-12v-2h12v2zm12-4h-24v-2h24v2zm0-4h-24v-2h24v2z"
      />
    </symbol>
  </svg>
</div>

<style>
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.25rem;
    height: var(--bars-height);
    background-color: var(--bars-color);
    backdrop-filter: blur(var(--bars-back-blur));
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    transition: font-size 0.25s ease-in-out;

    z-index: 999;
    box-shadow: var(--theme-shadow);
  }
  .toolbar__left,
  .toolbar__right {
    display: flex;
    align-items: center;
  }
  .toolbar__hero {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--fs-big);

    cursor: pointer;
  }
  .hero__img {
    height: 1.5em;
  }
  .toolbar__search {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    position: relative;
  }
  .toolbar__search input {
    border: none;
    outline: none;
    background-color: var(--back-color);
    color: var(--text-color);
    padding: 0.2em 0.5em;
    font-size: 1.3em;
    border-radius: 5px;
  }
  .toolbar__small {
    font-size: 0.85em;
  }
  .toolbar__favorites {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1em;
    position: relative;
    background-color: var(--back-color);
    padding: 0.5em;
    border-radius: 50%;
    transition: background-color 0.25s ease-in-out;
    cursor: pointer;
  }
  .favorites__icon {
    width: 1.15em;
    height: 1.15em;
    fill: var(--text-color);
    transition: fill 0.25s ease-in-out;
  }
  .toolbar__favorites.active {
    background-color: var(--theme-color);
  }
  .toolbar__favorites.active .favorites__icon {
    fill: var(--back-color);
  }
</style>
