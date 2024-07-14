import { artist, currentID, musicTitle, poster, smallPoster } from "./player";
import audioStreamGetter, { findBestStream } from "./audioStreamGetter";
import { play, reset, useSource } from "./AudioPlayer.svelte";

import type { FavoriteStore } from "$types/FavoritesStore";

let workingOnId: string | null = null;

export async function wantPlay(item: FavoriteStore) {
    const id = item.id;

    if (workingOnId === id) return;

    // reset currentID while fetching
    currentID.set('');


    musicTitle.set(item.title);

    // reset the current audio stream
    reset();

    const [apiRes, API_URL] = await audioStreamGetter(id);

    poster.set(apiRes.thumbnailUrl);
    smallPoster.set(item.poster);
    artist.set(item.artist);

    useSource(findBestStream(apiRes.audioStreams), API_URL, () => wantPlay(item));
    play();

    workingOnId = null;

    currentID.set(id);
}
