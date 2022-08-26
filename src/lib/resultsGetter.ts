import type { Results } from '../types/Results';

export default async function resultsGetter(query: string): Promise<[Results, Error]> {
    // fetch https://pipedapi.kavin.rocks/streams/:id
    try {
        const res = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=music_songs`);
        return [await res.json(), null];
    } catch (e) {
        return [null, e];
    }
}