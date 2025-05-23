<script lang="ts">
  import { playNextList, menuEntries, currentID, playNextIndex } from '$store';
  import Modal from '$lib/Modal.svelte';
  import './PlayNextController';
  import PlayNextList from './PlayNextList.svelte';
  import ActionButton from '$lib/ActionButton.svelte';
  import { wantPlay } from '$lib/wantPlay';
  import { tick } from 'svelte';
  import { playNextSong, playPreviousSong } from './PlayNextController';
  import { shuffle } from '$lib/shuffle';

  let modalClosed = $state(true);
  let canOpenModal = $state(true);

  let forceOpenEffect = $state(false);

  let modalEl: HTMLDivElement | null = $state(null);

  async function scrollIntoPlaying(smooth = false) {
    await tick();
    const playing = modalEl?.querySelector('.item .selected');
    if (playing)
      playing.scrollIntoView({
        block: 'center',
        behavior: smooth ? 'smooth' : 'instant',
      });
  }

  playNextList.subscribe((val) => {
    if (val.length === 0) return (canOpenModal = false);

    canOpenModal = true;
  });

  $effect(() => {
    canOpenModal === false && (modalClosed = true);
  });
  // scrolls to the currently playing item every time the modal is opened
  $effect(() => {
    if (!modalClosed) scrollIntoPlaying();
  });
  // scrolls smoothly to the currently playing item every time the currentID changes
  $effect(() => {
    $currentID;
    scrollIntoPlaying(true);
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="modal-button translucent"
  class:button-visible={canOpenModal}
  class:is-open={!modalClosed || forceOpenEffect}
  onclick={() => (modalClosed = false)}
  oncontextmenu={() => {
    forceOpenEffect = true;
    $menuEntries = [
      {
        title: 'Clear Play Next',
        action: () => {
          $playNextList = [];
          forceOpenEffect = false;
        },
        discardAction: () => (forceOpenEffect = false),
        breakAfter: true,
      },
      {
        title: 'Play Previous',
        action: () => {
          playPreviousSong();
          forceOpenEffect = false;
        },
        disabled: $playNextIndex === 0,
        discardAction: () => (forceOpenEffect = false),
      },
      {
        title: 'Play Next',
        action: () => {
          playNextSong();
          forceOpenEffect = false;
        },
        disabled: $playNextIndex === $playNextList.length - 1,
        discardAction: () => (forceOpenEffect = false),
      },
    ];
  }}
>
  <svg class="play-next-icon">
    <use xlink:href="#play-next" />
  </svg>
  <div class="info-text">
    Play<br />Next
  </div>
</div>

<Modal bind:closed={modalClosed} maxWidth={'70vw'}>
  {#snippet custom__content({ closeAction })}
    <div bind:this={modalEl}>
      <div class="title">Play Next <span class="beta">(Beta)</span></div>
      <div style="padding-top:0.5em;display:flex;gap:0.5em;">
        <ActionButton
          title="Re-Shuffle & Play"
          scale="0.8"
          backgroundColor="var(--back-color)"
          primary={true}
          onclick={() => {
            $playNextList = shuffle($playNextList);
            wantPlay($playNextList[0]);
          }}
        />
        <ActionButton
          title="Clear Play Next"
          scale="0.8"
          backgroundColor="var(--back-color)"
          onclick={() => {
            closeAction(() => ($playNextList = []));
            modalClosed = true;
          }}
        />
      </div>
      <PlayNextList />
    </div>
  {/snippet}
</Modal>

<svg style="display: none;">
  <symbol id="play-next" viewBox="0 0 24 24">
    <path
      d="M15 21v-10l9 5-9 5zm-3 0h-12v-2h12v2zm0-4.024h-12v-2h12v2zm0-3.976h-12v-2h12v2zm12-4h-24v-2h24v2zm0-6v2h-24v-2h24z"
    />
  </symbol>
</svg>

<style>
  .modal-button {
    position: fixed;
    top: calc(var(--bars-height) + 6em);
    right: 0;
    z-index: 100;
    width: 6em;
    height: 3em;
    border-radius: 1.5em 0% 0% 1.5em;
    cursor: pointer;

    display: flex;
    align-items: center;

    transform: translateX(100%);
    transition: transform 0.2s ease-in-out;
  }
  .modal-button.button-visible {
    transform: translateX(50%);
    box-shadow: var(--theme-shadow);
  }
  .modal-button:hover,
  .modal-button.is-open {
    transform: translateX(0%);
  }

  .play-next-icon {
    --size: 1.3em;
    width: var(--size);
    height: var(--size);

    /* element visual re-alignment tweak */
    margin-left: 1em;

    fill: var(--theme-color);
  }

  .info-text {
    font-size: 0.7em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;

    /* element visual re-alignment tweak */
    margin-left: 1em;
  }

  /* Modal styles */
  .title {
    font-size: var(--fs-big);
  }
  .beta {
    font-size: 0.5em;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--theme-color);

    vertical-align: top;
  }
</style>
