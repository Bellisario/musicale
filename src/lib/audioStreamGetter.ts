// cspell:word ungap

import any from '@ungap/promise-any';

import type { AudioStreamResponse, OStream } from '$types/AudioStreamResponse';
import { get } from 'svelte/store';
import { failedStreamURLs } from './player';

class Fetcher {
    private controller: AbortController;
    public promise: Promise<Response>;

    constructor(url: string, id: string) {
        this.controller = new AbortController();
        this.promise = new Promise((resolve, reject) => {
            fetch(`${url}/streams/${id}`, { signal: this.controller.signal })
                .then((res) => {
                    if (res.ok) {
                        resolve(res as Response)
                    } else {
                        reject(res)
                    }
                })
                .catch((err) => reject(err as Error));
        })
    }

    abort() {
        this.controller.abort();
    }
}

export const API_URLs = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.projectsegfau.lt',
    // 'https://pipedapi.moomoo.me',
    'https://de-api-piped.shimul.me',
    'https://papius.palash.dev',
    'https://piped-api.garudalinux.org',
    'https://pa.il.ax',
    'https://p.plibre.com',
]

export default async function audioStreamGetter(id: string): Promise<[AudioStreamResponse, string]> {
    // filter out failed APIs
    const WORKING_APIs = API_URLs.filter((url) => get(failedStreamURLs).includes(url) === false);

    const APIs = WORKING_APIs.map((url) => new Fetcher(url, id));

    const promises = APIs.map((api) => api.promise);

    function abortAll() {
        APIs.forEach((api) => api.abort());
    }

    let res: Response;
    try {
        res = await any(promises);
    } catch (err) {
        if (err instanceof Error) {
            if (err.name === 'AggregateError') {
                alert('Error\nAll APIs are down\n\nTry again later');
                location.reload();
            }
        }
        throw err;
    }

    const json = await res.json();
    abortAll();

    return [json, new URL(res.url).origin];
}

export function findBestStream(streams: OStream[]): string {
    return streams
        // use only mp4 streams
        .filter(stream => stream.mimeType === 'audio/mp4')
        // sort by bitrate
        .sort((a, b) => b.bitrate - a.bitrate)
    // get the first stream URL (highest bitrate)
    [0].url;
}
