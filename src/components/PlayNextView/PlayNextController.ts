import {
    playNextList,
    ended,
    currentID,
    albumsAddedToPlayNext,
    favoritesPlayStatus,
    playNextIndex,
} from '$lib/player';

import { wantPlay } from '$lib/wantPlay';

import { get } from 'svelte/store';

/* behavior of Play Next controller:
    1. if Play Next is empty and user is adding a song to Play Next, play the song
    2. if user adds a song to Play Next and Play Next never played before,
        wait until the current playing song ends, then play songs in Play Next
    3. if the user plays manually a song not in Play Next and was playing Play Next,
        after it ends, keep playing Play Next from the next song
        the user was playing before playing a song manually
*/

let playNextWasEmpty = true;
let lastPlayNextID = '';

function playNext(forcedID = '') {
    // if the song is ended, play the next song
    const wasPlayingID = forcedID || get(currentID);

    // find the index of the current playing song
    const index = get(playNextList).findIndex((item) => {
        return item.id === wasPlayingID;
    });

    // if the index is the last index, it means the song is the last song
    if (index === get(playNextList).length - 1) return;

    const newItem = get(playNextList)[index + 1];

    // play the next song
    wantPlay(newItem);
}

currentID.subscribe((id) => {
    // find the Play Next index of the current playing song
    const index = get(playNextList).findIndex((item) => {
        return item.id === id;
    });

    // if the song is not in Play Next, return
    if (index === -1) return;

    lastPlayNextID = id;
});
ended.subscribe(() => {
    // 3. if playing a song not in Play Next and was playing Play Next,
    //      after it ends, keep playing Play Next from the next song
    if (lastPlayNextID !== get(currentID))
        return playNext(lastPlayNextID);

    playNext();
});
playNextList.subscribe((list) => {
    if (
        playNextWasEmpty && list.length > 0 // 1.
        && get(currentID) === '' // 2.
    )
        playNext();

    playNextWasEmpty = list.length === 0;
});

// reset albumsAddedToPlayNext and favoritesPlayStatus to default values
// when the user clears the Play Next list
playNextList.subscribe((list) => {
    if (list.length !== 0) return;

    albumsAddedToPlayNext.set({});
    favoritesPlayStatus.set(-1);
});

export function playPreviousSong() {
    const index = get(playNextIndex);
    // if there is no song in playNextList, return
    if (index === null) return;

    // if the index is the first index, it means the song is already the first song
    if (index === 0) return;

    // play the previous song
    wantPlay(get(playNextList)[index - 1]);
}

export function playNextSong() {
    const index = get(playNextIndex);
    // if there is no song in playNextList, return
    if (index === null) return;

    // if the index is the last index, it means the song is the last song
    if (index === get(playNextList).length - 1) return;

    // play the next song
    wantPlay(get(playNextList)[index + 1]);
}

if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPreviousSong();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNextSong();
    });
}
