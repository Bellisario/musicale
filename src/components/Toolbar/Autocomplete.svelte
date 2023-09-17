<script lang="ts">
  // cspell:word mousedown mouseup mouseleave HTMLUListElement

  import { createEventDispatcher, onMount } from 'svelte';
  import truncate from 'just-truncate';
  import { query } from '$lib/player';

  const dispatch = createEventDispatcher();

  type ApiResponse = string[];

  export let searchFocus: boolean;
  export let completionAcceptedIndex: number;

  let el: HTMLUListElement;

  let choosing = false;

  let controller: AbortController;

  let lastText: string;

  $: $query, update();
  // $: searchFocus, updateFocus();

  let items: string[] = [];
  // const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  $: completionAcceptedIndex, updateQuery();

  function updateQuery() {
    lastText = $query = items[completionAcceptedIndex] || $query;
  }

  async function update() {
    if ($query === lastText) return;

    if ($query.trim() === '') {
      items = [];
      return;
    }
    let response: Response | undefined;
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    try {
      response = await fetch(
        `https://pipedapi.kavin.rocks/suggestions?query=${encodeURIComponent(
          $query.trim()
        )}`,
        {
          signal: controller.signal,
        }
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
    }
    if (response === undefined) return (items = []);
    const data: ApiResponse = await response.json();
    try {
      items = data.slice(0, 5);
    } catch {}
  }

  // function updateFocus() {
  //   // delay to allow element click to complete
  //   setTimeout(() => {
  //     if (choosing) return;
  //     isVisible = searchFocus;
  //   }, 300);
  // }

  async function submit(item: string) {
    $query = item;
    dispatch('submit');
  }

  onMount(() => {
    el.addEventListener('mousedown', (_) => {
      choosing = true;
    });
    el.addEventListener('mouseup', (_) => {
      choosing = false;
    });
    el.addEventListener('mouseleave', (_) => {
      choosing = false;
    });
  });
</script>

<ul
  bind:this={el}
  class:visible={items.length !== 0 && (searchFocus || choosing)}
>
  {#each items as item, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <li
      class:highlight={completionAcceptedIndex === index}
      on:click={() => submit(item)}
    >
      {truncate(item, 30)}
    </li>
  {/each}
</ul>

<style>
  ul {
    position: absolute;
    left: 0;
    top: 2em;
    background-color: var(--bars-color);
    width: 100%;
    padding: 1em;
    list-style: none;
    border-radius: 15px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    display: none;
  }
  ul.visible {
    display: block;
  }
  li {
    cursor: pointer;
  }
  li + li {
    margin-top: 0.5em;
    position: relative;
  }
  li + li::before {
    content: '';
    top: -0.25em;
    height: 1px !important;
    width: 100%;
    background-color: var(--text-color);
    position: absolute;
    opacity: 0.2;
  }
  li.highlight {
    color: var(--theme-color);
  }
</style>
