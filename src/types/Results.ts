// cspell:word nextpage

interface Results {
    items:      Result[];
    nextpage:   string;
    suggestion: string;
    corrected:  boolean;
}

interface Result {
    url:              string;
    title:            string;
    thumbnail:        string;
    uploaderName:     string;
    uploaderUrl:      null | string;
    uploaderAvatar:   null | string;
    uploadedDate:     null | string;
    shortDescription: null | string;
    duration:         number;
    views:            number;
    uploaded:         number;
    uploaderVerified: boolean;
}

export { type Results, type Result };