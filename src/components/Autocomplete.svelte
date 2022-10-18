<script type="ts">
  // cspell:word mousedown mouseup mouseleave HTMLUListElement

  import { createEventDispatcher, onMount } from 'svelte';
  import truncate from 'just-truncate';
  
  const dispatch = createEventDispatcher();

  type ApiResponse =
    | {
        error: true;
        type: 'no-query' | 'invalid' | 'server-error';
        results: [];
      }
    | {
        error: false;
        results: string[];
      };

  export let query: string;
  export let searchFocus: boolean;

  let el: HTMLUListElement;

  let choosing = false;

  let controller: AbortController;

  $: query, update();
  // $: searchFocus, updateFocus();

  let items: string[] = [];
  // const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  async function update() {
    if (query.trim() === '') {
      items = [];
      return;
    }
    let response: Response;
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    try {
      response = await fetch(
      `https://musicautocomplete.deno.dev/search?q=${encodeURIComponent(query)}`,
      {
        signal: controller.signal,
      }
    );
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
    }
    const data: ApiResponse = await response.json();
    items = data.results.slice(0, 5);
  }

  // function updateFocus() {
  //   // delay to allow element click to complete
  //   setTimeout(() => {
  //     if (choosing) return;
  //     isVisible = searchFocus;
  //   }, 300);
  // }

  async function submit(item: string) {
    query = item;
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
  {#each items as item}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <li on:click={() => submit(item)}>{truncate(item, 33)}</li>
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
</style>
