import {
    playNextList,
    ended,
    currentID,
    musicTitle,
    poster,
    smallPoster,
    artist
} from '$lib/player';
import urlToId from '$lib/urlToId';

import { reset, useSource, play } from '$lib/AudioPlayer.svelte';
import audioStreamGetter from '$lib/audioStreamGetter';

import { get } from 'svelte/store';

import type { Result } from '$types/Results';


ended.subscribe((isEnded) => {
    if (!isEnded) return;

    const wasPlayingID = get(currentID);

    // find the index of the current playing song
    const index = get(playNextList).findIndex((result) => {
        return urlToId(result.url) === wasPlayingID;
    });

    // if the index is the last index, it means the song is the last song
    if (index === get(playNextList).length - 1) return;

    // play the next song
    wantPlay(get(playNextList)[index + 1]);
});

async function wantPlay(result: Result) {
    // reset currentID while fetching
    currentID.set('');

    const id = urlToId(result.url);

    musicTitle.set(result.title);

    // reset the current audio stream
    reset();
    const apiRes = await audioStreamGetter(id);

    poster.set(apiRes.thumbnailUrl);
    smallPoster.set(result.thumbnail);
    artist.set(result.uploaderName);

    const streamUrl = apiRes.audioStreams.filter(
        (stream) => stream.mimeType === 'audio/mp4'
    )[0].url;
    console.log(streamUrl);
    useSource(streamUrl);
    play();

    currentID.set(id)
}

if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('previoustrack', () => {
        // if there is no song in playNextList, return
        if (get(playNextList).length === 0) return;

        const wasPlayingID = get(currentID);

        // find the index of the current playing song
        const index = get(playNextList).findIndex((result) => {
            return urlToId(result.url) === wasPlayingID;
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
        const index = get(playNextList).findIndex((result) => {
            return urlToId(result.url) === wasPlayingID;
        });

        // if the index is the last index, it means the song is the last song
        if (index === get(playNextList).length - 1) return;

        // play the next song
        wantPlay(get(playNextList)[index + 1]);
    });
}
