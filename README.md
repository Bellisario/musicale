# Musicale

> Music, with style.

Musicale is a music player for the web. It's built with Svelte, Vite and TypeScript for the best user and dev experience.

> Try it on [musicale.tk](https://musicale.tk)

## Features

- Simple and clean UI
- Search musics and preview their thumbnail
- Click on a result to play in a snap
- App loads fully offline (with SW) _(note results and music playing requires an internet connection)_
- Frequency bars with a click _(YouTube Music doesn't have this feature)_
- Favorite musics (with local storage and shuffle option)

Why don't see any photo?

> Because you can see and try by yourself on https://musicale.tk

## Why?

Today music players are slow (also on loading) and interrupt you with ads audios if free or let you pay for a premium account.

Musicale is a free and open source alternative to those players and streams music from YouTube Music _(through a third party API)_.

## API

The interesting thing about Musicale is that there is no backend and the API it's from [Piped](https://github.com/TeamPiped/Piped) (a privacy-friendly alternative YouTube frontend), which is well documented [here](https://piped-docs.kavin.rocks/).

There is also an autocomplete API, made by me, to get the search suggestions. You can find more info about it [here](https://musicautocomplete.deno.dev/) and the source code [here](https://github.com/Bellisario/musicautocomplete).

## Legal

We do NOT host or scrape any Youtube Music content, we use a PUBLIC available API to provide user a playable URL of the music through a good-looking interface, WITHOUT violating any laws.

Musicale is NOT affiliated with Piped, YouTube, YouTube Music or Google in any way. All the content played on Musicale is offered by third parties and is NOT hosted by Musicale.

If you suspect a violation of your rights, you should contact the respective third party providers.

> **Note:** Musicale uses Piped as API but servers used may NOT be affiliated with Piped itself.

## Contributing

We :heart: contributions!\
Feel free to open an [issue](https://github.com/Bellisario/musicale/issues) or a [pull request](https://github.com/Bellisario/musicale/pulls) but follow [Contributing Guidelines](https://github.com/Bellisario/musicale/blob/main/CONTRIBUTING.md).

> **Tip:** if you don't know where to start, check out the [help wanted issues](https://github.com/Bellisario/musicale/labels/help%20wanted)!

## License

MIT License [here](https://github.com/Bellisario/musicale/blob/main/LICENSE).
