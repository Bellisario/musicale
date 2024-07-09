import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import { get, writable } from 'svelte/store';
import { animatedFocusPreference } from '$lib/player';

const cubicTweened = (value: number, duration: number = 150) =>
    tweened(value, {
        duration: duration,
        easing: cubicOut,
    });

export const top = cubicTweened(0);
export const left = cubicTweened(0);
export const width = cubicTweened(0);
export const height = cubicTweened(0);
export const radius = cubicTweened(0, 100);

export const showFocusOutline = writable(false);

// this var discards quick focus/blur events
let nothingFocused = true;
showFocusOutline.subscribe((value) => {
    setTimeout(() => {
        if (value === false && value === get(showFocusOutline)) {
            nothingFocused = true;
        } else {
            nothingFocused = false;
        }
    }, 50);
});

// animatedFocusPreference.update(value => value);
animatedFocusPreference.subscribe((value) => {
    if (value === 'off') {
        document.body.classList.remove('focusable-active');
    } else {
        document.body.classList.add('focusable-active');
    }
});

let blinkInterval: NodeJS.Timeout;

interface FocusableProps {
    margin?: number;
    /**
     * By default it's automatically inferred from the border-radius css property
     */
    borderRadius?: number;
    type?: 'default' | 'list';
    autoScroll?: boolean;
}

function preventClickFocusOutline(e: Event) {
    if (e.target instanceof HTMLInputElement) return;
    e.preventDefault();
    showFocusOutline.set(false);
}

window.addEventListener('resize', () => {
    if (blinkInterval) clearInterval(blinkInterval);
    showFocusOutline.set(false);
});

export default function focusable(el: HTMLInputElement | HTMLButtonElement | HTMLDivElement | HTMLAnchorElement, options: FocusableProps = {}) {
    el.addEventListener('mousedown', preventClickFocusOutline);
    el.addEventListener('focus', () => handleFocus(el, options));
    el.addEventListener('blur', () => showFocusOutline.set(false));

    if (el instanceof HTMLDivElement) {
        el.addEventListener('keydown', handleKeyDown);
    }

    el.classList.add('focusable');

    return {
        destroy() {
            el.removeEventListener('mousedown', preventClickFocusOutline);
            el.removeEventListener('focus', () => handleFocus(el, options));
            el.removeEventListener('blur', () => showFocusOutline.set(false));

            if (el instanceof HTMLDivElement) {
                el.removeEventListener('keydown', handleKeyDown);
            }
        }
    }
}

async function handleFocus(el: HTMLInputElement | HTMLButtonElement | HTMLDivElement | HTMLAnchorElement, options: FocusableProps) {
    let nothingWasFocused = nothingFocused;

    if (blinkInterval) clearInterval(blinkInterval);

    if (get(animatedFocusPreference) === 'off') return;

    showFocusOutline.set(true);

    if (options.autoScroll !== false)
        el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })

    const bounds = el.getBoundingClientRect();
    const computedStyle = getComputedStyle(el);
    let duration = 150;

    if (nothingWasFocused) {
        duration = 0;
    }

    top.set(bounds.top - (options.margin ?? 0) + window.scrollY, { duration });
    left.set(bounds.left - (options.margin ?? 0), { duration });
    width.set(bounds.width + (options.margin ?? 0) * 2, { duration });
    height.set(bounds.height + (options.margin ?? 0) * 2, { duration });

    if (options.borderRadius) {
        radius.set(options.borderRadius);
    } else if (computedStyle.borderRadius.endsWith('px')) {
        radius.set(Number(computedStyle.borderRadius.slice(0, -2)));
    } else if (computedStyle.borderRadius === '50%') {
        radius.set(999);
    } else {
        radius.set(0);
        console.warn(`Border radius "${computedStyle.borderRadius}" is not supported`);
    }

    // blinking on active element
    if (el.classList.contains('active')) {
        const BLINK_BORDER = 3;

        let currentBorder = BLINK_BORDER;

        blinkInterval = setInterval(() => {
            if (!el.classList.contains('active')) {
                clearInterval(blinkInterval);
                currentBorder = 0;
            };

            top.set(bounds.top - currentBorder - (options.margin ?? 0) + window.scrollY, { duration });
            left.set(bounds.left - currentBorder - (options.margin ?? 0), { duration });
            width.set(bounds.width + currentBorder * 2 + (options.margin ?? 0) * 2, { duration });
            height.set(bounds.height + currentBorder * 2 + (options.margin ?? 0) * 2, { duration });

            if (currentBorder === 0) {
                currentBorder = BLINK_BORDER;
            } else {
                currentBorder = 0;
            }
        }, 350);
    }
}

function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Enter') return;

    (e.target as HTMLDivElement).click();

    const PADDING = 10;

    const backupTop = get(top);
    const backupLeft = get(left);
    const backupWidth = get(width);
    const backupHeight = get(height);

    top.set(backupTop + PADDING)
    left.set(backupLeft + PADDING)
    width.set(backupWidth - PADDING * 2)
    height.set(backupHeight - PADDING * 2)

    // click animation
    setTimeout(() => {
        top.set(backupTop);
        left.set(backupLeft);
        width.set(backupWidth);
        height.set(backupHeight);
    }, 100);
}
