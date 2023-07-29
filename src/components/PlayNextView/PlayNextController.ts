import {
    playNextList,
    ended,
    currentID,
} from '$lib/player';

import { wantPlay } from '$lib/playNext';

import { get } from 'svelte/store';


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
