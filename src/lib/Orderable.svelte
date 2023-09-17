<script lang="ts">
  import { flip } from 'svelte/animate';
  import { onMount, tick, type SvelteComponent } from 'svelte';

  export let itemsData: any[];
  export let Item: typeof SvelteComponent<{ item: any; dragEl?: boolean }>;
  export let dataType: string;
  export let gap: string;

  let draggingId: string | undefined;
  let hoveringIndex: number | undefined;
  let draggingIndex: number | undefined;

  let draggingTemplateEl: HTMLDivElement;
  let draggingEl: HTMLDivElement;

  let sizeCheckerEl: HTMLDivElement;
  let orderableHeight: number;

  onMount(() => {
    orderableHeight = sizeCheckerEl.offsetHeight;
    sizeCheckerEl.remove();
  });

  async function onDragStart(e: DragEvent, data: string) {
    if (!e.dataTransfer) return;

    e.dataTransfer.setData(`application/musicale-${dataType}`, data);
    e.dataTransfer.effectAllowed = 'move';

    draggingIndex = itemsData.findIndex((f) => f.id === data);

    await tick();

    draggingEl = draggingTemplateEl.cloneNode(true) as HTMLDivElement;
    draggingEl.style.position = 'absolute';
    draggingEl.style.top = '-1000px';
    draggingEl.style.opacity = '1';

    document.body.appendChild(draggingEl);

    e.dataTransfer.setDragImage(draggingEl, 0, 0);

    requestAnimationFrame(() => {
      draggingId = data;
    });
  }
  function onDragEnd(_: DragEvent) {
    draggingId = undefined;
    hoveringIndex = undefined;
    draggingIndex = undefined;

    draggingEl.remove();
  }
  function onDragOver(e: DragEvent) {
    e.preventDefault();

    if (!e.dataTransfer) return;

    e.dataTransfer.dropEffect = 'move';

    const targetItemId = (e.currentTarget as HTMLDivElement).dataset.id;

    if (targetItemId === 'before-first') {
      hoveringIndex = -1;
      return;
    }

    const targetItemIndex = itemsData.findIndex((f) => f.id === targetItemId);

    hoveringIndex = targetItemIndex;
  }
  function onDrop(e: DragEvent) {
    if (!e.dataTransfer) return;

    if (hoveringIndex === undefined || draggingIndex === undefined)
      throw new Error(
        'expected hoveringIndex and draggingIndex to be set before drop'
      );

    let draggingOffset = 0;

    const data = e.dataTransfer.getData(`application/musicale-${dataType}`);

    const movingItem = itemsData.find((f) => f.id === data);

    if (!movingItem) {
      return;
    }

    itemsData = itemsData.filter((f) => f.id !== data);

    if (hoveringIndex < draggingIndex) {
      draggingOffset += 1;
    }

    if (hoveringIndex === -1) {
      draggingOffset = 1;
    }

    // add the item to the array
    itemsData = [
      ...itemsData.slice(0, hoveringIndex + draggingOffset),
      movingItem,
      ...itemsData.slice(hoveringIndex + draggingOffset),
    ];
  }
</script>

<div class="size-checker" bind:this={sizeCheckerEl}>
  <Item item={itemsData[0]} />
</div>
<div class="dragging-el" bind:this={draggingTemplateEl}>
  <Item item={itemsData[draggingIndex || 0]} dragEl={true} />
</div>
<div
  class:is-dragging={draggingId !== undefined}
  style="--orderable-height:{orderableHeight}px;--gap:{gap};"
  class="orderable {$$props.class}"
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="drop-handler"
    data-id="before-first"
    class:hovering={hoveringIndex === -1}
    on:dragover={onDragOver}
    on:dragend={onDragEnd}
    on:drop={onDrop}
  />
  {#each itemsData as itemData, i (itemData.id)}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="item"
      data-id={itemData.id}
      class:dragging={draggingId === itemData.id}
      class:hovering={hoveringIndex === i}
      draggable="true"
      on:dragstart={(e) => onDragStart(e, itemData.id)}
      on:dragover={onDragOver}
      on:dragend={onDragEnd}
      on:drop={onDrop}
      animate:flip={{ duration: 300 }}
    >
      <Item item={itemData} />
    </div>
  {/each}
</div>

<style>
  .orderable {
    display: grid;
    gap: var(--gap);

    --_z-index: 100;
  }
  .item {
    position: relative;

    background-color: transparent;
  }

  .size-checker,
  .dragging-el {
    position: absolute;
    top: -1000px;
    left: -1000px;
    opacity: 0;
  }

  .drop-handler {
    position: relative;
  }

  /* showing where the element will be dropped */
  .is-dragging .drop-handler.hovering::after,
  .is-dragging .item.hovering::after {
    content: '';
    position: absolute;
    height: 2px;
    width: 50%;
    bottom: 0;
    background-color: var(--theme-color);

    transform: translateY(calc(var(--gap) / 2));

    z-index: var(--_z-index);
  }
  .is-dragging .drop-handler.hovering::after {
    transform: translateY(calc(-50% + var(--gap) / 2));
  }

  /* drop handler (tracking if the element is being hovered) */
  .is-dragging .drop-handler:before,
  .is-dragging .item:before {
    content: '';
    position: absolute;

    width: 100%;

    top: 0;

    /* debug only */
    /* background-color: var(--theme-color);
    opacity: 0.1; */

    z-index: calc(var(--_z-index) - 1);
  }
  .is-dragging .drop-handler::before {
    transform: translateY(-50%);
    /* "3" is a magic number: should find a better solution */
    height: calc(var(--orderable-height) + var(--gap) * 3);
  }
  .is-dragging .item::before {
    transform: translateY(50%);
    height: calc(var(--orderable-height) + var(--gap));
  }
</style>
