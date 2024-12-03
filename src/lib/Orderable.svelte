<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { onMount, tick, type Component } from 'svelte';

  interface Props {
    itemsData: any[],
    Item: Component<{ item: any; dragEl?: boolean }, {}, ''>,
    dataType: string,
    gap: string,
    class: string
  }

let { itemsData = $bindable(), Item, dataType, gap, class: classProps }: Props = $props()

  // export let itemsData: any[];
  // export let Item: Component<{ item: any; dragEl?: boolean }, {}, ''>;
  // export let dataType: string;
  // export let gap: string;

  let draggingId: string | undefined = $state();
  let hoveringIndex: number | undefined = $state();
  let draggingIndex: number | undefined = $state();

  let draggingTemplateEl: HTMLDivElement;
  let draggingEl: HTMLDivElement;

  let sizeCheckerEl: HTMLDivElement;
  let orderableHeight: number| undefined = $state();

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
  function ondragend(_: DragEvent) {
    draggingId = undefined;
    hoveringIndex = undefined;
    draggingIndex = undefined;

    draggingEl.remove();
  }
  function ondragover(e: DragEvent) {
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
  function ondrop(e: DragEvent) {
    if (!e.dataTransfer) return;

    if (hoveringIndex === undefined || draggingIndex === undefined)
      throw new Error(
        'expected hoveringIndex and draggingIndex to be set before drop',
      );

    let draggingOffset = 0;

    const data = e.dataTransfer.getData(`application/musicale-${dataType}`);

    const movingItem = itemsData.find((f) => f.id === data);

    if (!movingItem) {
      return;
    }

    // @ts-ignore
    itemsData = itemsData.filter((f) => f.id !== data);

    if (hoveringIndex < draggingIndex) {
      draggingOffset += 1;
    }

    if (hoveringIndex === -1) {
      draggingOffset = 1;
    }

    // add the item to the array
    // @ts-ignore
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
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class:is-dragging={draggingId !== undefined}
  style="--orderable-height:{orderableHeight}px;--gap:{gap};"
  class="orderable {classProps}"
>
  <div
    class="drop-handler"
    data-id="before-first"
    class:hovering={hoveringIndex === -1}
    {ondragover}
    {ondragend}
    {ondrop}
  ></div>
  {#each itemsData as itemData, i (itemData.id)}
    <div
      class="item"
      data-id={itemData.id}
      class:dragging={draggingId === itemData.id}
      class:hovering={hoveringIndex === i}
      draggable="true"
      ondragstart={(e) => onDragStart(e, itemData.id)}
      {ondragover}
      {ondragend}
      {ondrop}
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
