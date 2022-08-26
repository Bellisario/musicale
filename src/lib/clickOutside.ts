// from https://github.com/rster2002/svelte-outside-click/blob/master/index.js

export default function clickOutside(node: Node, onEventFunction: Function) {
    const handleClick = (e: Event) => {
        var path = e.composedPath();

        if (!path.includes(node)) {
            onEventFunction();
        }
    }

    document.addEventListener("click", handleClick);

    return {
        destroy() {
            document.removeEventListener("click", handleClick);
        }
    }
}
