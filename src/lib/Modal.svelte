<script lang="ts">
  // cspell:word evenodd linejoin miterlimit outroend
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';
  import { fade } from 'svelte/transition';

  interface Props {
    closed?: boolean;
    closable?: boolean;
    focusTrap?: boolean;
    maxWidth?: string;
    custom__content?: Snippet<[any]>;
    title?: Snippet;
    children?: Snippet;
    content__bottom?: Snippet;
    content__bottom_center?: Snippet;
    content__bottom_small?: Snippet;
  }

  let {
    closed = $bindable(false),
    closable = true,
    focusTrap = true,
    maxWidth = '500px',
    custom__content,
    title,
    children,
    content__bottom,
    content__bottom_center,
    content__bottom_small,
  }: Props = $props();

  let closeAction: () => void = $state(() => {});
  const setCloseAction = (fn: () => void) => (closeAction = fn);

  let el: HTMLDivElement | undefined = $state();
  let focusableElements: NodeListOf<HTMLButtonElement> | null = null;

  async function getFocusableButtons() {
    if (!el) return;

    await tick();

    focusableElements = el.querySelectorAll('.focusable');

    focusPrimaryButton();
  }
  function clearFocusableButtons() {
    focusableElements = null;
  }
  function focusPrimaryButton() {
    if (!focusableElements) return;
    for (let i = 0; i < focusableElements.length; i++) {
      if (focusableElements[i].classList.contains('primary')) {
        focusableElements[i].focus();
        return;
      }
    }
    focusableElements[0].focus();
  }

  // lock focus on modal buttons
  function onModalBlur(e: FocusEvent) {
    if (!focusTrap) return;

    if (!focusableElements) return;
    if ([...focusableElements].includes(e.relatedTarget as HTMLButtonElement))
      return;

    let position: number;

    try {
      position = focusableElements[0].compareDocumentPosition(
        e.relatedTarget as HTMLElement,
      );
    } catch (e) {
      return;
    }

    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      focusableElements[0].focus();
    } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      focusableElements[focusableElements.length - 1].focus();
    } else {
      focusPrimaryButton();
    }
  }

  function handleEscape(e: KeyboardEvent) {
    if (e.key === 'Escape' && closable) {
      closed = true;
    }
  }
  function onClickSelf(e: MouseEvent) {
    // @ts-ignore
    if (e.target !== this) {
      return;
    }

    if (closable) {
      closed = true;
    }
  }

  $effect(() => {
    closed === false && focusTrap
      ? getFocusableButtons()
      : clearFocusableButtons();
  });
</script>

<svelte:window onkeydown={handleEscape} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if !closed}
  <div
    bind:this={el}
    class="modal"
    transition:fade|global={{ duration: 150 }}
    onclick={onClickSelf}
    onoutroend={() => {
      if (!closeAction) return;

      closeAction();
      closeAction = () => {};
    }}
  >
    <div
      class="modal__content"
      class:closable
      style:max-width={maxWidth}
      onfocusout={onModalBlur}
    >
      {#if closable}
        <div class="modal__close" onclick={() => (closed = true)}>
          <svg
            clip-rule="evenodd"
            fill-rule="evenodd"
            stroke-linejoin="round"
            stroke-miterlimit="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"
            /></svg
          >
        </div>
      {/if}
      {#if custom__content}
        {@render custom__content?.({ closeAction: setCloseAction })}
      {:else}
        <div class="content__title">
          {@render title?.()}
        </div>
        {@render children?.()}
        {#if content__bottom}
          <div class="content__bottom">
            {@render content__bottom?.()}
          </div>
        {:else if content__bottom_center}
          <div class="content__bottom-center">
            {@render content__bottom_center?.()}
          </div>
        {:else if content__bottom_small}
          <div class="content__bottom-small">
            {@render content__bottom_small?.()}
          </div>
        {/if}
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgb(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 998;
  }
  .modal__content {
    background-color: var(--bars-color);
    backdrop-filter: blur(var(--bars-back-blur));
    border-radius: 0.7em;
    padding: 1rem 1.5rem;
    width: 90%;
    max-width: 500px;
    box-shadow: var(--theme-shadow);
    position: relative;

    max-height: 80vh;
    overflow-y: auto;
  }
  .modal__close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    height: 1.5rem;
    width: 1.5rem;
    font-size: 1.5rem;
    cursor: pointer;
    fill: var(--theme-color);
    background-color: var(--back-color);
    margin: 0;
    border-radius: 50%;
    cursor: pointer;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal__close > svg {
    width: 1.2rem;
  }
  .content__title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  .content__bottom {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }
  .content__bottom-center {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
  }
  .content__bottom-small {
    margin-top: 1rem;
    font-size: 0.8rem;
  }

  /* custom scrollbar */
  .modal__content::-webkit-scrollbar-thumb {
    background-color: #6b6b6b;
    border: 4px solid transparent;
    border-radius: 8px;
    background-clip: padding-box;
  }
  .modal__content::-webkit-scrollbar-thumb:hover {
    background-color: #939393;
  }
  .modal__content::-webkit-scrollbar-track {
    background-color: transparent;
  }
  .modal__content::-webkit-scrollbar {
    width: 16px;
  }
</style>
