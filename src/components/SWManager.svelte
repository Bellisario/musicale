<script lang="ts">
  import { useRegisterSW } from 'virtual:pwa-register/svelte';
  import { fade } from 'svelte/transition';

  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(swr) {
      console.log(`SW registered: ${swr}`);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  function close() {
    offlineReady.set(false);
    needRefresh.set(false);
  }

  setTimeout(() => {
    if ($needRefresh) return;
    close();
  }, 4000);

  $: toast = $offlineReady || $needRefresh;
</script>

{#if toast}
  <div class="pwa-toast translucent" transition:fade|global>
    <div class="message">
      {#if $offlineReady}
        <span>Ready to work offline!</span>
      {:else}
        <span>Reload to update</span>
      {/if}
    </div>
    {#if $needRefresh}
      <button on:click={() => updateServiceWorker(true)}>Reload</button>
    {/if}
    <button on:click={close} class="close">Close</button>
  </div>
{/if}

<style>
  .pwa-toast {
    font-size: 0.9em;
    position: fixed;
    display: inline-flex;
    align-items: center;
    gap: 0.75em;
    bottom: var(--bars-height);
    left: 0;
    margin: 1.5em 1em;
    padding: 1em;
    border: 1px solid #8885;
    border-radius: 10px;
    z-index: 1;
    text-align: left;
    box-shadow: var(--theme-shadow);
  }
  .pwa-toast .message {
    color: var(--text-color);
  }
  .pwa-toast button {
    all: unset;
    cursor: pointer;
    background-color: var(--theme-color);
    color: var(--bars-color);
    border-radius: 0.5em;
    padding: 0.25em 0.5em;
    text-align: left;
  }
  .pwa-toast button.close {
    background-color: var(--bars-color);
    color: var(--theme-color);
  }
</style>
