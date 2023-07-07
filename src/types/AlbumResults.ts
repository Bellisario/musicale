interface AlbumResults {
    items:      AlbumResult[];
    nextpage:   string;
    suggestion: string;
    corrected:  boolean;
}

interface AlbumResult {
    url:              string;
    type:             string;
    name:             string;
    thumbnail:        string;
    uploaderName:     string;
    uploaderUrl:      null;
    uploaderVerified: boolean;
    playlistType:     string;
    videos:           number;
}

export { type AlbumResults, type AlbumResult };
