<script lang="ts">
  export let title = '<empty>';
  export let active = false;
  export let color: string = null;
  export let backgroundColor: string = null;
  export let fitContent = true;
  export let scale: string = null;

  let styles = {
    'theme-color': color,
    'bars-color': backgroundColor,
    fs: scale,
  };

  function getStyle(properties: { [key: string]: string }) {
    return Object.entries(properties)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => `--${key}: ${value};`)
      .join(' ');
  }
</script>

<button
  class="btn"
  class:btn--active={active}
  on:click
  style={getStyle(styles)}
  class:fitContent
>
  <span class="btn__span">{title}</span>
</button>

<style>
  .btn {
    all: unset;

    font-size: calc(var(--fs, 1) * 1em);

    height: 2.8em;
    min-width: 8.5em;
    padding: 0 0.5em;
    border-radius: 0.5em;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bars-color);
    cursor: pointer;
    transition-property: color, background-color, opacity;
    transition-duration: 300ms;
    transition-timing-function: ease-in-out;
  }
  .btn.fitContent {
    width: fit-content;
  }
  .btn:hover {
    opacity: 0.8;
  }
  .btn__span {
    display: block;
    color: var(--theme-color);
    font-size: 1.1em;
    font-weight: 700;
  }
  .btn--active {
    background-color: var(--theme-color);
  }
  .btn--active .btn__span {
    color: var(--bars-color);
  }
</style>
