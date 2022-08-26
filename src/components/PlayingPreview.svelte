<script type="ts">
  // cspell:word keyframes xlink

  import { poster, musicTitle, artist } from '../lib/player';
  import { fade } from 'svelte/transition';

  let localPoster: string;
  let posterHidden = true;

  let firstLoad = true;

  function revokePoster() {
    try {
      URL.revokeObjectURL(localPoster);
    } catch {
      // do nothing
    }
  }

  poster.subscribe(async () => {
    posterHidden = true;
    revokePoster();
    if ($poster === '') {
      return;
    }
    firstLoad = false;
    const res = await fetch($poster);
    if (!res.ok) {
      return;
    }
    const blob = await res.blob();
    localPoster = URL.createObjectURL(blob);
    posterHidden = false;
  });
</script>

<div class="playing-preview">
  <div class="preview-poster" id="preview-poster">
    {#if !posterHidden}
      <div
        transition:fade
        class="poster-image"
        style="background-image: url({localPoster});"
      />
    {:else if firstLoad}
      <svg class="party-icon">
        <use xlink:href="#party" />
      </svg>
    {/if}
  </div>
  <div class="first-load {firstLoad ? '' : 'hiding'}">
    Play a song to see info here
  </div>
  {#if $musicTitle !== '' && $artist !== ''}
    <div class="preview-info" transition:fade>
      <div class="preview-info__title">{$musicTitle}</div>
      <div class="preview-info__artist">{$artist}</div>
    </div>
  {/if}
  <svg style="display:none;">
    <symbol id="party" viewBox="0 0 24 24">
      <path
        d="M2.5 19.245l.816 1.506 1.684.31-1.18 1.241.225 1.698-1.545-.739-1.545.739.225-1.698-1.18-1.241 1.684-.31.816-1.506zm19.293-3.851l-.917-.326-1.946 5.471c-1.44-.856-3.521-.263-3.98 1.028-.386 1.085.276 1.953 1.211 2.286 1.11.395 2.609.035 3.183-1.574l1.471-4.135c1.42 1.766 1.881 1.979 1.617 3.305.684-.622 1.002-1.098 1.204-1.664.615-1.729-2.338-3-1.843-4.391zm-7.61-12.343l-8.13 5.493 2.849 7.266c-1.789.323-2.981 2.243-2.438 3.627.467 1.191 1.635 1.43 2.646 1.033 1.201-.47 2.18-1.837 1.502-3.571l-2.381-6.074 6.149-3.992 1.885 4.806c-1.786.323-2.98 2.238-2.439 3.618.468 1.195 1.662 1.427 2.668 1.032 1.192-.467 2.16-1.828 1.483-3.562l-3.794-9.676zm-11.683 8.005l-2.5 2.5 2.5 2.5 2.5-2.5-2.5-2.5zm18.346-8.056l1.029 1.9 2.125.392-1.489 1.566.284 2.142-1.949-.932-1.95.932.284-2.142-1.489-1.566 2.125-.392 1.03-1.9zm-12.193-2.381l-.863-.619-3.284 4.575c-1.059-1.622-3.104-2.051-4.158-.582-.651.907-.341 2.187.538 2.818 1.046.751 2.666.91 3.634-.435l4.133-5.757z"
      />
    </symbol></svg
  >
</div>

<style>
  .first-load {
    z-index: -1;
    margin-top: 1em;
  }
  .first-load.hiding {
    animation: first-load-hiding 250ms ease-in-out forwards;
  }
  @keyframes first-load-hiding {
    0% {
    }
    100% {
      margin-top: -1em;
      opacity: 0;
      transform: scale(0);
    }
  }
  .playing-preview {
    --content-size: 70%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: sticky;
    top: 20vh;
  }
  .preview-poster {
    width: var(--content-size);
    padding-bottom: var(--content-size);
    position: relative;
    border-radius: 15px;
    overflow: hidden;
    background-color: var(--bars-color);
    box-shadow: var(--theme-shadow);
  }
  .poster-image {
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    position: absolute;
    background-size: cover;
    background-position: center;
  }
  .preview-info {
    width: var(--content-size);
    padding: 0.75em 0.5em;
  }
  .preview-info__title {
    font-size: 1.25rem;
    font-weight: bold;
  }
  .party-icon {
    inset: 0;
    width: 50%;
    height: 50%;
    position: absolute;
    margin: auto;
    fill: var(--theme-color);
    opacity: 0.75;
  }
</style>
