import type { Results } from '$types/Results';
import type { AlbumResults } from '$types/AlbumResults';

const baseURL = 'https://pipedapi.kavin.rocks';

export async function resultsGetter(query: string): Promise<Results> {
    // fetch https://pipedapi.kavin.rocks/search?q=<param>&filter=music_songs
    const res = await fetch(`${baseURL}/search?q=${encodeURIComponent(query)}&filter=music_songs`);

    return await res.json();
}

export async function resultsAlbumGetter(query: string): Promise<AlbumResults> {
    // fetch https://pipedapi.kavin.rocks/search?q=<param>&filter=music_albums
    const res = await fetch(`${baseURL}/search?q=${encodeURIComponent(query)}&filter=music_albums`);

    return await res.json();
}

export async function loadMoreResults(query: string, nextpage: string): Promise<[Results, null] | [null, Error]> {
    // fetch https://pipedapi.kavin.rocks/nextpage/search?nextpage=<param>
    try {
        const res = await fetch(`${baseURL}/nextpage/search?nextpage=${encodeURIComponent(nextpage)}&q=${encodeURIComponent(query)}&filter=music_songs`);
        return [await res.json(), null];
    } catch (e: any) {
        return [null, e];
    }
}