
export default function urlToId(url: string): string {
    // make /watch?v=123 into 123
    return url.split('v=')[1].split('&')[0];
}
