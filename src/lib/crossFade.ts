// cspell:word crossfade

// not used yet, should use after loading screen to match logo animation

// code from: https://dev.to/buhrmi/svelte-component-transitions-5ie
import { quintOut } from 'svelte/easing';
import { crossfade } from 'svelte/transition';
const [send, receive] = crossfade({
    duration: d => Math.sqrt(d * 300),
    fallback(node, _) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;

        return {
            duration: 1000,
            easing: quintOut,
            css: t => `
                transform: ${transform} scale(${t});
            `
        };
    }
});

export { send, receive };
