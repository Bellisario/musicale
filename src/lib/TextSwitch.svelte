<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let buttonsWidth = '5rem';

  export let label: string;
  export let options: string[];

  export let selected = 0;

  let tweenedSelected = tweened(selected, {
    duration: 300,
    easing: cubicOut,
  });

  $: $tweenedSelected = selected;

  const padding = '0.3em';
</script>

<div
  class="container"
  style="--buttons-width:{buttonsWidth};--padding:{padding};--selected:{$tweenedSelected};"
>
  <span>{label}</span>

  <div class="buttons-container">
    <div class="selector" />
    {#each options as option, i}
      <button
        class:selected={selected === i}
        on:click={() => {
          selected = i;
        }}
      >
        {option}
      </button>
    {/each}
  </div>
</div>

<style>
  .container {
    display: flex;
    align-items: center;
  }
  span {
    margin-right: 1ch;
  }
  .buttons-container {
    --button-radius: 0.5em;

    background-color: var(--bars-color);
    padding: var(--padding);
    border-radius: calc(var(--button-radius) + var(--padding));

    position: relative;

    isolation: isolate;
  }

  button {
    background-color: unset;
    color: #fff;

    border: 0;
    padding-block: 0.5em;
    font-size: 1rem;

    width: var(--buttons-width);

    position: relative;

    opacity: 0.5;

    transition: opacity 100ms ease-in-out;

    cursor: pointer;
  }
  button.selected {
    transition: opacity 300ms ease-in-out;
    opacity: 1;
  }

  .selector {
    position: absolute;
    top: var(--padding);
    bottom: var(--padding);

    left: calc(var(--selected) * var(--buttons-width) + var(--padding));
    width: var(--buttons-width);

    border-radius: var(--button-radius);
    background-color: var(--back-color);

    transition: opacity 0.2s ease-in-out;

    animation: all 0.2s ease-in-out;

    z-index: -1;
  }
</style>
