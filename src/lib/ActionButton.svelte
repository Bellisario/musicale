<script type="ts">
  export let title = '<empty>';
  export let active = false;
</script>

<div class="btn" class:btn--active={active} on:click>
  <span class="btn__span">{title}</span>
</div>

<style>
  .btn {
    height: 2.8em;
    width: fit-content;
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
