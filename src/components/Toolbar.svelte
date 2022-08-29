<script type="ts">
  // cspell:word instanceof keydown
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import Autocomplete from './Autocomplete.svelte';

  const dispatch = createEventDispatcher();

  let search: HTMLInputElement;
  let searchFocus = false;

  function submit() {
    blur();
    dispatch('submit');
  }

  function blur() {
    search.blur();
  }

  export let query = '';
  export let inputFocus: boolean;

  $: inputFocus === false && blur();

  let isSmall = false;

  document.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      isSmall = true;
    } else {
      isSmall = false;
    }
  });

  // focus on "/" key press and after loading
  onMount(() => {
    search.focus();
    search.onfocus = () => {
      searchFocus = true;
    }
    search.onblur = () => {
      searchFocus = false;
    }
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
    <div class="toolbar__hero" on:click={heroClick}>Musicale</div>
  </div>
  <div class="toolbar__right">
    <form class="toolbar__search" on:submit|preventDefault={submit}>
      <input
        type="text"
        placeholder="Search"
        bind:value={query}
        bind:this={search}
      />
      <Autocomplete bind:query on:submit={submit} bind:searchFocus />
    </form>
  </div>
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
</style>
