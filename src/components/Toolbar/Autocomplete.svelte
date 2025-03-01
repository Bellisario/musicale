<script lang="ts">
  import truncate from 'just-truncate';
  import { query, apiURLs } from '$store';

  type ApiResponse = string[];

  interface Props {
    searchFocus: boolean;
    completionAcceptedIndex: number;
    dispatchSubmit: (e?: any) => void;
  }

  let {
    searchFocus = $bindable(),
    completionAcceptedIndex = $bindable(),
    dispatchSubmit,
  }: Props = $props();

  let choosing = $state(false);

  let controller: AbortController;

  let lastText: string;

  let lastItems: string[] = $state([]);
  $effect(() => {
    lastText = $query = lastItems[completionAcceptedIndex] || $query;
  });

  async function update(q: string) {
    if (q === lastText) return lastItems;

    if (q.trim() === '') {
      return [];
    }
    let response: Response | undefined;
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    try {
      response = await fetch(
        `${$apiURLs[0]}/suggestions?query=${encodeURIComponent(
          q.trim(),
        )}`,
        {
          signal: controller.signal,
        },
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return [];
      }
    }
    if (response === undefined) return [];
    const data: ApiResponse = await response.json();
    try {
      lastItems = data.slice(0, 5);
      return lastItems;
    } catch {
      return [];
    }
  }

  async function submit(item: string) {
    $query = item;
    dispatchSubmit();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
{#snippet list(items: string[])}
  {#each items as item, index}
    <li
      class:highlight={completionAcceptedIndex === index}
      onclick={() => submit(item)}
    >
      {truncate(item, 30)}
    </li>
  {/each}
{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
{#if $query.trim() !== '' && (searchFocus || choosing)}
  <ul
    onmousedown={() => (choosing = true)}
    onmouseup={() => (choosing = false)}
    onmouseleave={() => (choosing = false)}
    class:visible={lastItems.length !== 0}
  >
    {#await update($query)}
      {@render list(lastItems)}
    {:then items}
      {@render list(items)}
    {/await}
  </ul>
{/if}

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
