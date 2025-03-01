<script lang="ts">
  import Footer from '../Footer.svelte';
  import {
    favorites,
    previousNextButtonsPreference,
    animatedFocusPreference,
  } from '$store';
  import type { FavoriteStore } from '$types/FavoritesStore';
  import ActionButton from '$lib/ActionButton.svelte';
  import { fade } from 'svelte/transition';

  import Modal from '$lib/Modal.svelte';
  import TextSwitch from '$lib/TextSwitch.svelte';

  const favoritesVersion = '1.0.0';
  interface FavoritesExport {
    __app__: 'musicale';
    version: string;
    favorites: FavoriteStore[];
  }
  let importMessage = $state('');
  let displayImportWarning = $state(false);

  let noFavorites = $derived($favorites.length === 0 ? true : false);

  function exportFavorites() {
    const data = JSON.stringify({
      __app__: 'musicale',
      version: favoritesVersion,
      favorites: $favorites,
    } as FavoritesExport);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'favorites.musicale.json';
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  function importFavorites(force: boolean = false) {
    if (!noFavorites && force !== true) {
      displayImportWarning = true;
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
      importMessage = '';

      if (!input.files)
        return (importMessage = 'Import failed. No file specified.');

      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data: FavoritesExport = JSON.parse(reader.result as string);
          if (
            data.__app__ !== 'musicale' ||
            data.version !== favoritesVersion
          ) {
            importMessage = 'Import failed. Invalid file.';
            return;
          }
          favorites.set(data.favorites);
          importMessage = 'Import successful.';
        } catch (err) {
          importMessage = 'Import failed. Invalid file.';
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  let previousNextButtonsSelectedIndex = $state(
    $previousNextButtonsPreference === 'on' ? 0 : 1,
  );

  $effect(() => {
    $previousNextButtonsPreference =
      previousNextButtonsSelectedIndex === 0 ? 'on' : 'off';
  });

  let animatedFocusSelectedIndex = $state(
    $animatedFocusPreference === 'on' ? 0 : 1,
  );

  $effect(() => {
    $animatedFocusPreference = animatedFocusSelectedIndex === 0 ? 'on' : 'off';
  });
</script>

<main>
  <!-- modal displayed to alert favorites import will remove the present ones -->
  <Modal closed={!displayImportWarning} closable={false}>
    {#snippet title()}
      <div>Favorites already present</div>
    {/snippet}
    <p>
      Seems there are some favorites already saved on Musicale.<br />By
      importing new ones, all the olds will be lost.
    </p>
    <p>If you want to keep the olds, press "Cancel" to abort.</p>
    {#snippet content__bottom()}
      <div>
        <div class="flex-buttons">
          <ActionButton
            title="Import"
            backgroundColor="var(--back-color)"
            scale="0.8"
            onclick={() => {
              displayImportWarning = false;
              importFavorites(true);
            }}
          />
          <ActionButton
            title="Cancel"
            backgroundColor="var(--back-color)"
            scale="0.8"
            primary={true}
            onclick={() => {
              displayImportWarning = false;
            }}
          />
        </div>
      </div>
    {/snippet}
  </Modal>
  <div class="settings">
    <div class="settings__title">Settings</div>
    <div class="settings__content">
      <section>
        <div class="content__title">Manage favorites</div>
        <div class="content__message">
          Since Musicale saves all your favorites locally, you probably want to
          export them if you're planning to use a new device.
        </div>
        <div class="content__buttons">
          <ActionButton
            title="Export Favorites"
            onclick={() => (noFavorites ? null : exportFavorites())}
            color="#fff"
            fitContent={false}
            scale="0.9"
            disabled={noFavorites}
            hoverTitle={noFavorites ? 'No favorites to export' : null}
          />
          <ActionButton
            title="Import Favorites"
            onclick={() => importFavorites()}
            color="#fff"
            fitContent={false}
            scale="0.9"
          />
        </div>
        {#if importMessage}
          <div class="import-message" in:fade|global>{importMessage}</div>
        {/if}
      </section>
      <section>
        <div class="content__title">Personalization</div>
        <div>
          <div class="forced_h-space">
            <TextSwitch
              label="Animated focus outline (Beta)"
              options={['On', 'Off']}
              bind:selected={animatedFocusSelectedIndex}
              buttonsWidth="3.5em"
            />
          </div>
        </div>
        <div>
          <div class="forced_h-space">
            <TextSwitch
              label="Previous/Next buttons on the player"
              options={['On', 'Off']}
              bind:selected={previousNextButtonsSelectedIndex}
              buttonsWidth="3.5em"
            />
          </div>
          <div class="content__message secondary">
            {#if previousNextButtonsSelectedIndex === 0}
              <span in:fade
                >Previous/Next buttons will be displayed on the player when
                using "Play Next".</span
              >
            {:else}
              <span in:fade
                >You can use keyboard shortcuts to navigate between tracks.</span
              >
            {/if}
          </div>
        </div>
      </section>
    </div>
  </div>
  <Footer size="small" />
</main>

<style>
  main {
    display: grid;
    padding: 2em;
    min-height: calc(100vh - var(--bars-height) * 2);
    align-content: space-between;
  }
  section + section {
    margin-top: 2em;
  }
  .settings__title {
    font-size: var(--fs-big);
    font-weight: 700;
  }
  .settings__content {
    max-width: 500px;
    max-width: 50ch;
  }
  .content__title {
    font-size: var(--fs-medium);
    font-weight: 700;
    margin-bottom: 1rem;
  }
  .content__message {
    margin-bottom: 1rem;
  }
  .content__message.secondary {
    opacity: 0.7;
    font-size: 0.9rem;
  }
  .content__buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding-inline: 5em;
    gap: 1em;
  }
  .import-message {
    text-align: center;
  }
  * + * {
    margin-top: 0.7em;
  }
  .flex-buttons {
    display: flex;
    flex-direction: row;
    gap: 1em;
  }
  .forced_h-space > :global(div) {
    display: flex;
    justify-content: space-between;
  }
</style>
