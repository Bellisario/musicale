<script lang="ts">
  import { animatedFocusPreference } from '$lib/player';
  import {
    showFocusOutline,
    top,
    left,
    width,
    height,
    radius,
  } from './focusable';
</script>

<div
  class="focus-outline"
  class:hidden={!$showFocusOutline || $animatedFocusPreference === 'off'}
  style="--top: {$top}px; --left: {$left}px; --width: {$width}px; --height: {$height}px; --radius: {$radius}px;"
/>

<style>
  .focus-outline {
    position: absolute;
    top: var(--top);
    left: var(--left);
    width: var(--width);
    height: var(--height);

    outline: 2px solid var(--theme-color);
    border-radius: var(--radius);

    z-index: 999;
    pointer-events: none;
  }
  .focus-outline.hidden {
    display: none;
  }
</style>
