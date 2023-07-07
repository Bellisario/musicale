import type { Result } from "./Results";

interface Album {
    name:           string;
    thumbnailUrl:   string;
    description:    string;
    bannerUrl:      null | string;
    nextpage:       null | string;
    uploader:       null | string;
    uploaderUrl:    null | string;
    uploaderAvatar: null | string;
    videos:         number;
    relatedStreams: Result[];
}

export { type Album }
