import {
    playNextList,
    ended,
    currentID,
    musicTitle,
    poster,
    smallPoster,
    artist
} from '$lib/player';

import { reset, useSource, play } from '$lib/AudioPlayer.svelte';
import audioStreamGetter, { findBestStream } from '$lib/audioStreamGetter';

import { get } from 'svelte/store';

import type { FavoriteStore } from '$types/FavoritesStore';


ended.subscribe((isEnded) => {
    if (!isEnded) return;

    const wasPlayingID = get(currentID);

    // find the index of the current playing song
    const index = get(playNextList).findIndex((item) => {
        return item.id === wasPlayingID;
    });

    // if the index is the last index, it means the song is the last song
    if (index === get(playNextList).length - 1) return;

    // play the next song
    wantPlay(get(playNextList)[index + 1]);
});

async function wantPlay(item: FavoriteStore) {
    // reset currentID while fetching
    currentID.set('');

    musicTitle.set(item.title);

    // reset the current audio stream
    reset();
    const apiRes = await audioStreamGetter(item.id);

    poster.set(apiRes.thumbnailUrl);
    smallPoster.set(item.poster);
    artist.set(item.artist);

    useSource(findBestStream(apiRes.audioStreams));
    play();

    currentID.set(item.id);
}

if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('previoustrack', () => {
        // if there is no song in playNextList, return
        if (get(playNextList).length === 0) return;

        const wasPlayingID = get(currentID);

        // find the index of the current playing song
        const index = get(playNextList).findIndex((item) => {
            return item.id === wasPlayingID;
        });

        // if the index is the first index, it means the song is the first song
        if (index === 0) return;

        // play the previous song
        wantPlay(get(playNextList)[index - 1]);
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
        // if there is no song in playNextList, return
        if (get(playNextList).length === 0) return;

        const wasPlayingID = get(currentID);

        // find the index of the current playing song
        const index = get(playNextList).findIndex((item) => {
            return item.id === wasPlayingID;
        });

        // if the index is the last index, it means the song is the last song
        if (index === get(playNextList).length - 1) return;

        // play the next song
        wantPlay(get(playNextList)[index + 1]);
    });
}
