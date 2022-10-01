import { writable } from 'svelte/store';
import type { FavoriteStore } from '../types/FavoritesStore';

export const duration = writable(0);
export const currentTime = writable(0);
export const paused = writable(true);
export const musicTitle = writable('');
export const volume = writable(0.75);
export const ended = writable(false);

export const poster = writable('');
export const smallPoster = writable('');
export const artist = writable('');
export const source = writable('');
export const currentID = writable('');

export const query = writable('');
export const toSearch = writable('');

export const favoritesActive = writable(localStorage.getItem('favoritesActive') === 'true');

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
