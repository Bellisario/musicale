<script lang="ts">
  import Footer from '../Footer.svelte';
  import {
    favorites,
    previousNextButtonsPreference,
    animatedFocusPreference,
    customInstancePreference,
  } from '$store';
  import ActionButton from '$lib/ActionButton.svelte';
  import { fade } from 'svelte/transition';

  import Modal from '$lib/Modal.svelte';
  import TextSwitch from '$lib/TextSwitch.svelte';
  import {
    exportFavorites,
    FavoritesImportError,
    importFavorites,
  } from './favoritesHandler';
  import focusable from '$lib/focuser/focusable';

  let importMessage = $state('');
  let displayImportWarning = $state(false);

  let noFavorites = $derived($favorites.length === 0 ? true : false);

  function handleImportFavorites(force = false) {
    displayImportWarning = false;

    if ($favorites.length !== 0 && force === false) {
      displayImportWarning = true;
      return;
    }

    importMessage = '';
    importFavorites().catch((e: FavoritesImportError) => {
      switch (e) {
        case FavoritesImportError.NO_FILE_SPECIFIED:
          importMessage = 'Import failed. No file specified.';
          break;
        case FavoritesImportError.INVALID_FILE:
          importMessage = 'Import failed. Invalid file.';
          break;
      }
    });
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

  // custom instance
  let customInstance = $state($customInstancePreference);
  let customInstanceValid = $derived.by(() => {
    if (customInstance === '') return true; // no custom instance => use default intances

    try {
      new URL(customInstance);
      return true;
    } catch {
      return false;
    }
  });

  function saveInstance() {
    if (customInstance === $customInstancePreference) return;

    if (customInstance !== '') {
      let url: string;
      try {
        url = new URL(customInstance).origin;
      } catch {
        console.error(
          'ERROR: custom instance expected to be a valid URL but found invalid data',
        );
        return;
      }
      customInstance = url;
    }

    $customInstancePreference = customInstance;
  }
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
              handleImportFavorites(true);
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
            onclick={() => handleImportFavorites()}
            color="#fff"
            fitContent={false}
            scale="0.9"
          />
        </div>
        {#if importMessage}
          <div class="import-message" in:fade|global>
            {importMessage}
          </div>
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
      <section>
        <div class="content__title">Custom instance</div>
        <div class="content__message">
          You can setup a custom Piped instance to use as an alternative of the
          official ones. Useful if you are experiencing downtimes.
        </div>
        <div id="custom-instance-group">
          <input
            id="custom-instance-url"
            type="text"
            placeholder="https://piped.example.com"
            bind:value={customInstance}
            onfocus={(e) => {
              (e.target as HTMLInputElement).select();
            }}
            onkeypress={(e) => {
              if (e.key !== 'Enter') return;

              saveInstance();

              (e.target as HTMLInputElement).blur();
            }}
            use:focusable
          />
          <ActionButton
            title="Save"
            onclick={saveInstance}
            scale="0.9"
            disabled={customInstance === $customInstancePreference ||
              !customInstanceValid}
          />
        </div>
        <div class="content__message secondary">
          {#if !customInstanceValid}
            Please enter a valid instance URL.
          {:else if customInstance !== $customInstancePreference}
            {#if customInstance.trim() === ''}
              Save to reset to default instance.
            {:else}
              Save to use the entered instance.
            {/if}
          {:else if customInstance === $customInstancePreference}
            {#if customInstance.trim() === ''}
              Currently using official instances.
            {:else}
              Currently using a custom instance. Clear the field and Save to use
              default instances.
            {/if}
          {:else}
            Save to reset to default instances.
          {/if}
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

  #custom-instance-group {
    display: flex;
    gap: 0.25em;
  }
  #custom-instance-url {
    width: 100%;
    font-size: 1em;
    padding: 0.2em 0.5em;
    /*border: 1px solid #3e3e3e;*/
    border: unset;
    color: var(--text-color);
    background-color: var(--bars-color);
    border-radius: 5px;
  }
</style>
