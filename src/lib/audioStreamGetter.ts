// cspell:word ungap

import any from '@ungap/promise-any';

import type AudioStreamResponse from 'src/types/AudioStreamResponse';


function APIFetch(url: string, id: string) {
    const controller = new AbortController();
    const promise = new Promise((resolve, reject) => {
        fetch(`${url}/streams/${id}`, { signal: controller.signal })
            .then((res) => {
                if (res.ok) {
                    resolve(res as Response)
                } else {
                    reject(res)
                }
            })
            .catch((err) => reject(err as Error));
    })
    return {
        promise,
        abort: () => {
            controller.abort();
        }
    };
}

export default async function audioStreamGetter(id: string): Promise<AudioStreamResponse> {
    const APIs = [
        APIFetch('https://pipedapi.kavin.rocks', id),
        APIFetch('https://pipedapi.moomoo.me', id),
        APIFetch('https://de-api-piped.shimul.me', id),
        APIFetch('https://papius.palash.dev', id),
        APIFetch('https://piped-api.garudalinux.org', id),
        APIFetch('https://pa.il.ax', id),
        APIFetch('https://p.plibre.com', id),
    ]

    const promises = APIs.map((api) => api.promise);

    function abortAll() {
        APIs.forEach((api) => api.abort());
    }

    let res: Response;
    try {
        res = await any(promises as unknown[] as Response[]);
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

    return json;
}
