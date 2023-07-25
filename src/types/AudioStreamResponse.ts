// cspell:word lbry

interface AudioStreamResponse {
    title:                   string;
    description:             string;
    uploadDate:              Date;
    uploader:                string;
    uploaderUrl:             string;
    uploaderAvatar:          string;
    thumbnailUrl:            string;
    hls:                     string;
    dash:                    null;
    lbryId:                  null;
    uploaderVerified:        boolean;
    duration:                number;
    views:                   number;
    likes:                   number;
    dislikes:                number;
    uploaderSubscriberCount: number;
    audioStreams:            OStream[];
    videoStreams:            OStream[];
    relatedStreams:          RelatedStream[];
    subtitles:               any[];
    livestream:              boolean;
    proxyUrl:                string;
    chapters:                any[];
}

interface OStream {
    url:        string;
    format:     string;
    quality:    string;
    mimeType:   string;
    codec:      null | string;
    videoOnly:  boolean;
    bitrate:    number;
    initStart:  number;
    initEnd:    number;
    indexStart: number;
    indexEnd:   number;
    width:      number;
    height:     number;
    fps:        number;
}

interface RelatedStream {
    url:              string;
    title:            string;
    thumbnail:        string;
    uploaderName:     string;
    uploaderUrl:      string;
    uploaderAvatar:   string;
    uploadedDate:     string;
    shortDescription: null;
    duration:         number;
    views:            number;
    uploaded:         number;
    uploaderVerified: boolean;
}

export type { AudioStreamResponse, OStream };