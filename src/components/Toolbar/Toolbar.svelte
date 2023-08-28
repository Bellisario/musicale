<script lang="ts">
  // cspell:word instanceof keydown onfocus onblur xlink
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import Autocomplete from './Autocomplete.svelte';

  import { receive } from '$lib/crossFade';

  import { favoritesActive, settingsActive, query, hash } from '$lib/player';

  import Logo from '$assets/logo.svg?raw';

  const dispatch = createEventDispatcher();

  let search: HTMLInputElement;
  let searchFocus = false;

  let completionAcceptedIndex = -1;

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  function submit() {
    blur();

    $hash.search = $query;
    $hash.album = '';

    $favoritesActive = false;
    $settingsActive = false;
  }

  function blur() {
    try {
      search.blur();
    } catch {
      onMount(() => search.blur());
    }
  }

  let isSmall = false;

  function isTouch() {
    return window.matchMedia('(any-hover: none)').matches;
  }

  // allow small toolbar only on non-touch devices and non-safari devices
  if (!(isTouch() || isSafari)) {
    document.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        isSmall = true;
      } else {
        isSmall = false;
      }
    });
  }

  function handleInputKeys(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (completionAcceptedIndex > 4) return (completionAcceptedIndex = 0);

      completionAcceptedIndex++;

      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();

      if (completionAcceptedIndex < 0) return (completionAcceptedIndex = 4);

      completionAcceptedIndex--;

      return;
    }
    if (e.key.toLowerCase().match(/a-z/)) {
      completionAcceptedIndex = -1;
    }
  }

  // focus on "/" key press
  function handleInput(e: KeyboardEvent) {
    // if focusing elements (ex. input) don't do anything
    if (document.activeElement !== document.body) return;

    if (e.key === '/') {
      e.preventDefault();
      search.focus();
      search.select();
    }
  }

  // focus after loading
  onMount(() => {
    if (!$hash.search) search.focus();

    search.onfocus = () => {
      searchFocus = true;
    };
    search.onblur = () => {
      searchFocus = false;
    };
  });

  function heroClick() {
    dispatch('home');
  }
</script>

<svelte:window on:keydown={handleInput} />

<div class="toolbar translucent {isSmall ? 'toolbar__small' : ''}">
  <div class="toolbar__left">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="toolbar__hero"
      on:click={heroClick}
      transition:receive|global={{ key: 'loading-screen', duration: 1000 }}
    >
      <div class="hero__img">
        {@html Logo}
      </div>
    </div>
  </div>
  <div class="toolbar__right">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="toolbar__settings"
      on:click={() => ($settingsActive = !$settingsActive)}
      class:active={$settingsActive}
      title="{$settingsActive ? 'Close' : 'Open'} settings"
    >
      <svg class="settings__icon">
        <use xlink:href="#settings" />
      </svg>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
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
        on:keydown={handleInputKeys}
        on:input={() => {
          completionAcceptedIndex = -1;
          searchFocus = true;
        }}
      />
      <Autocomplete
        on:submit={submit}
        bind:completionAcceptedIndex
        bind:searchFocus
      />
    </form>
  </div>
  <svg style="display:none;">
    <symbol id="favorites" viewBox="0 0 24 24">
      <path
        d="M12 21h-12v-2h12v2zm4-9l8-1v6.681c-.002 1.555-1.18 2.319-2.257 2.319-.907 0-1.743-.542-1.743-1.61 0-.96.903-1.852 2-2.073v-2.317l-4 .5v4.181c-.002 1.555-1.18 2.319-2.257 2.319-.907 0-1.743-.542-1.743-1.61 0-.96.903-1.852 2-2.073v-5.317zm-4 4.976h-12v-2h12v2zm0-3.976h-12v-2h12v2zm12-4h-24v-2h24v2zm0-4h-24v-2h24v2z"
      />
    </symbol>
    <symbol id="settings" viewBox="0 0 24 24">
      <path
        d="M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"
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

    /* fix for Safari logo position (hardcoding SVG aspect ratio) */
    aspect-ratio: 202 / 57;
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
  .toolbar__favorites,
  .toolbar__settings {
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
  .favorites__icon,
  .settings__icon {
    width: 1.15em;
    height: 1.15em;
    fill: var(--text-color);
    transition: fill 0.25s ease-in-out;
  }
  .toolbar__favorites.active,
  .toolbar__settings.active {
    background-color: var(--theme-color);
  }
  .toolbar__favorites.active .favorites__icon,
  .toolbar__settings.active .settings__icon {
    fill: var(--back-color);
  }
</style>
