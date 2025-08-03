import { derived, writable } from 'svelte/store';
import type { FavoriteStore } from '$types/FavoritesStore';
import { type MenuEntry } from '$types/MenuEntry';

import { createHashStore } from 'svelte-hash';
import { localStorageWritable } from './localStorageWritable';

export const apiURLs = writable(['https://pipedapi.kavin.rocks']);

// instances from by https://github.com/n-ce/Uma
fetch('https://raw.githubusercontent.com/n-ce/Uma/main/dynamic_instances.json')
    .then(res => res.json())
    .then(data => {
        if (data.proxy?.length)
            apiURLs.set(data.proxy);
        else if (data.piped?.length)
            apiURLs.set(data.piped);
    });

export const duration = writable(0);
export const currentTime = writable(0);
export const paused = writable(true);
export const musicTitle = writable('');
export const volume = localStorageWritable('volume', 0.7, {
    serialize: String,
    deserialize: Number,
});
export const ended = writable(false);

export const poster = writable('');
export const smallPoster = writable('');
export const artist = writable('');
export const source = writable('');
export const currentID = writable('');

export const query = writable('');

export const favoritesActive = localStorageWritable('favoritesActive', false, {
    serialize: (value) => value.toString(),
    deserialize: (value) => value === 'true',
});
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

export const favorites = localStorageWritable<FavoriteStore[]>('favorites', [], {
    serialize: (value) => JSON.stringify(value),
    deserialize: (value) => JSON.parse(value),
});
export const previousNextButtonsPreference = localStorageWritable<'on' | 'off'>('previousNextButtonsPreference', 'on');
export const animatedFocusPreference = localStorageWritable<'on' | 'off'>('animatedFocusPreference', 'on');

interface Hash {
    search: string;
    album: string;
}
export const hash = createHashStore<Hash>();
