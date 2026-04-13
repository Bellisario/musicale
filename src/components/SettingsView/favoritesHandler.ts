import { favorites } from '$lib/store';
import type { FavoriteStore } from '$types/FavoritesStore';
import { get } from 'svelte/store';

const FAVORITES_VERSION = '1.0.0';
interface FavoritesExport {
    __app__: 'musicale';
    version: string;
    favorites: FavoriteStore[];
}

export function exportFavorites() {
    const data = JSON.stringify({
        __app__: 'musicale',
        version: FAVORITES_VERSION,
        favorites: get(favorites),
    } as FavoritesExport);

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'favorites.musicale.json';
    a.href = url;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export enum FavoritesImportError {
    NO_FILE_SPECIFIED,
    INVALID_FILE,
}

export function importFavorites() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    return new Promise((resolve, reject) => {
        input.click();
        input.onchange = () => {
            if (!input.files)
                return reject(FavoritesImportError.NO_FILE_SPECIFIED);

            const file = input.files[0];

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data: FavoritesExport = JSON.parse(
                        reader.result as string,
                    );
                    if (
                        data.__app__ !== 'musicale' ||
                        data.version !== FAVORITES_VERSION
                    ) {
                        return reject(FavoritesImportError.INVALID_FILE);
                    }

                    favorites.set(data.favorites);
                    return resolve(undefined);
                } catch (err) {
                    return reject(FavoritesImportError.INVALID_FILE);
                }
            };
            reader.readAsText(file);
        };
    });
}
