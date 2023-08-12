<script lang="ts">
  import clickOutside from '$lib/clickOutside';
  import { fade } from 'svelte/transition';
  import { tick } from 'svelte';

  import { type MenuEntry } from '$types/MenuEntry';

  export let entries: MenuEntry[];

  const callDiscardActions = () =>
    entries.forEach((entry) => entry.discardAction?.());

  let position = {
    x: 0,
    y: 0,
  };

  let menuEl: HTMLDivElement;
  let showMenu = false;

  async function contextMenuAction(event: MouseEvent) {
    if (entries.length === 0) return;

    const { clientX, clientY } = event;

    showMenu = true;

    await tick();

    const { height: menuWidth, width: menuHeight } =
      menuEl.getBoundingClientRect();

    position = {
      x:
        menuHeight + clientX > window.innerWidth
          ? clientX - menuHeight
          : clientX,
      y:
        menuWidth + clientY > window.innerHeight
          ? clientY - menuWidth
          : clientY,
    };
  }
  function closeMenu(callback?: () => void) {
    if (callback) callback();

    showMenu = false;

    entries = [];
  }
</script>

<svelte:window on:scroll={() => closeMenu(callDiscardActions)} />
<svelte:body on:contextmenu|preventDefault={contextMenuAction} />

{#if showMenu}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="transparent-back" on:contextmenu|stopPropagation={() => {}} />
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="menu translucent"
    bind:this={menuEl}
    use:clickOutside={() => closeMenu(callDiscardActions)}
    on:contextmenu|stopPropagation={() => {}}
    out:fade|global={{ duration: 250 }}
    style="--x: {position.x}; --y: {position.y}"
  >
    {#each entries as entry}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="menu-item"
        class:disabled={entry.disabled}
        on:click={() => (entry.disabled ? null : closeMenu(entry.action))}
      >
        {entry.title}
      </div>
      {#if entry.breakAfter}
        <div class="break-item" />
      {/if}
    {/each}
  </div>
{/if}

<style>
  .transparent-back {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1999;
  }

  .menu {
    position: fixed;
    top: calc(var(--y) * 1px);
    left: calc(var(--x) * 1px);

    background-color: var(--bars-color);
    border: 1px solid #3e3e3e;
    border-radius: 0.7rem;
    padding: 0.5em;

    min-width: 200px;

    z-index: 2000;

    user-select: none;

    box-shadow: var(--theme-shadow);
  }
  .menu-item {
    padding: 0.5em;
    border-radius: 0.5rem;

    cursor: default;
  }
  .menu-item.disabled {
    opacity: 0.5;
  }
  .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.09);
  }
  .menu-item.disabled:hover {
    background-color: transparent;
  }
  .menu-item:active {
    background-color: rgba(255, 255, 255, 0.18);
  }
  .menu-item.disabled:active {
    background-color: transparent;
  }

  .break-item {
    height: 1px;
    background-color: #3e3e3e;
    margin: 0.2em;
  }
</style>
