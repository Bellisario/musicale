import { get, writable } from 'svelte/store';
import type { FavoriteStore } from '$types/FavoritesStore';
import type MenuEntry from '$types/MenuEntry';
import type { Result } from '$types/Results';

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

export const playNextList = writable<Result[]>([]);

export const currentSearchType = writable<number>(0);

export const albumsAddedToPlayNext = writable<Record<string, number>[]>([]);

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

export function secondsToTime(seconds: number) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0'),
        m = Math.floor(seconds % 3600 / 60).toString().padStart(2, '0'),
        s = Math.floor(seconds % 60).toString().padStart(2, '0');
    if (h === '00')
        return m + ':' + s;
    return h + ':' + m + ':' + s;
};


// ------------------------------------------------------------
// HASH Management
// ------------------------------------------------------------

interface Hash {
    search?: string;
    album?: string;
    [key: string]: string;
}

export const hash = writable<Hash>(loadHash());

function updateHash() {

    const hashValues = get(hash);
    const urlHash = new URLSearchParams(window.location.hash.slice(1));

    // get keys
    Object.keys(hashValues).forEach((key) => {
        // get value
        const value = hashValues[key];

        // if value is empty, return
        if (value === '') return urlHash.delete(key);

        // set value
        urlHash.set(key, value);
    });

    if (window.location.hash.slice(1) === urlHash.toString()) return;

    // set hash
    window.history.pushState(null, '', `#${urlHash.toString()}`);
}

function loadHash() {
    const urlHash = new URLSearchParams(window.location.hash.slice(1));

    const hashValues: Hash = {};

    // get keys
    urlHash.forEach((value, key) => {
        // set value
        hashValues[key] = value;
    });

    return hashValues;
}

hash.subscribe(updateHash);

// listen for history changes
window.addEventListener('popstate', () => {
    hash.set(loadHash());
});
