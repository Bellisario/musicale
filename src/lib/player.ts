import { derived, writable } from 'svelte/store';
import type { FavoriteStore } from '$types/FavoritesStore';
import { type MenuEntry } from '$types/MenuEntry';

import { createHashStore } from 'svelte-hash';

export const duration = writable(0);
export const currentTime = writable(0);
export const paused = writable(true);
export const musicTitle = writable('');
export const volume = writable(Number(localStorage.getItem('volume')) || 0.7);
volume.subscribe((value) => localStorage.setItem('volume', String(value)));
export const ended = writable(false);

export const poster = writable('');
export const smallPoster = writable('');
export const artist = writable('');
export const source = writable('');
export const currentID = writable('');

export const query = writable('');

export const favoritesActive = writable(localStorage.getItem('favoritesActive') === 'true');
export const settingsActive = writable(false);

export const menuEntries = writable<MenuEntry[]>([])

export const playNextList = writable<FavoriteStore[]>([]);

export const playNextIndex = derived([playNextList, currentID], ([$playNextList, $currentID]) => {
    // if there is no song in playNextList, return
    if ($playNextList.length === 0) return null;

    // find the index of the last Play Next song
    const index = $playNextList.findIndex((item) => {
        return item.id === $currentID;
    });

    return index;
});

export const currentSearchType = writable<number>(0);

interface AlbumsAddedToPlayNext {
    [key: string]: number
}
export const albumsAddedToPlayNext = writable<AlbumsAddedToPlayNext>({});

export const favoritesPlayStatus = writable(-1);

export const failedStreamURLs = writable<string[]>([]);

// if settings active, reset favorites active to false
settingsActive.subscribe((value) => value === true ? favoritesActive.set(false) : null);
// if favorites active, reset settings active to false
favoritesActive.subscribe((value) => value === true ? settingsActive.set(false) : null);

favoritesActive.subscribe((value) => {
    localStorage.setItem('favoritesActive', value.toString());
});

export const favorites = writable<FavoriteStore[]>(localStorage.getItem('favorites') ? JSON.parse(localStorage.getItem('favorites')!) : []);

favorites.subscribe((value) => {
    localStorage.setItem('favorites', JSON.stringify(value));
});

function evaluateSavedPreviousNextButtonsPreference() {
    const preference = localStorage.getItem('previousNextButtonsPreference');
    if (preference === 'on' || preference === 'off') return preference;
    return 'on';
}
export const previousNextButtonsPreference = writable<'on' | 'off'>(evaluateSavedPreviousNextButtonsPreference());

previousNextButtonsPreference.subscribe((value) => {
    localStorage.setItem('previousNextButtonsPreference', value);
});

function evaluateSavedAnimatedFocusPreference() {
    const preference = localStorage.getItem('animatedFocusPreference');
    if (preference === 'on' || preference === 'off') return preference;
    return 'on';
}
export const animatedFocusPreference = writable<'on' | 'off'>(evaluateSavedAnimatedFocusPreference());

animatedFocusPreference.subscribe((value) => {
    localStorage.setItem('animatedFocusPreference', value);
});

export function secondsToTime(seconds: number) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0'),
        m = Math.floor(seconds % 3600 / 60).toString().padStart(2, '0'),
        s = Math.floor(seconds % 60).toString().padStart(2, '0');
    if (h === '00')
        return m + ':' + s;
    return h + ':' + m + ':' + s;
};

export function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

interface Hash {
    search: string;
    album: string;
}
export const hash = createHashStore<Hash>();
