<script lang="ts">
  import IntersectionObserver from '$lib/IntersectionObserver.svelte';
  import { hash } from '$lib/player';
  import type { AlbumResult } from '$types/AlbumResults';
  import { fade } from 'svelte/transition';

  export let album: AlbumResult;

  function getPlaylistId(url: string) {
    const playlistId = url.split('list=')[1];

    if (!playlistId) throw new Error('Invalid playlist url');

    return playlistId;
  }

  const lazyLoad = (el: HTMLDivElement) => {
    el.onload = () => {
      el.style.opacity = '1';
    };
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="album"
  in:fade|global
  on:click={() => ($hash.album = getPlaylistId(album.url))}
>
  <div class="img-container">
    <IntersectionObserver let:intersecting top={150} once={true}>
      <img
        src={intersecting ? album.thumbnail : ''}
        alt={album.name}
        class="result__img"
        use:lazyLoad
      />
    </IntersectionObserver>
  </div>
  <div class="text">
    <div class="title">{album.name}</div>
    <div class="author">{album.uploaderName}</div>
  </div>
</div>

<style>
  .img-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 0.5rem;

    background-color: var(--bars-color);
    box-shadow: var(--theme-shadow);
  }
  img {
    user-select: none;
    pointer-events: none;

    object-fit: cover;
    width: 100%;
    transform-origin: center;

    opacity: 0;
    transition: opacity 0.5s ease-in;

    border-radius: 0.5rem;
  }

  .album {
    display: grid;
    grid-template-columns: 1fr;

    text-align: center;

    cursor: pointer;
  }
  .text {
    text-align: start;
    margin-top: 1em;
  }

  .title {
    font-size: 1.3em;
  }
</style>
