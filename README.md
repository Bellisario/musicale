<div align="center">
  <a href="https://musicale.tk">
    <img src="https://github.com/Bellisario/musicale/blob/main/.github/musicale-github.png" alt="musicale-logo"></img>
  </a>
</div>

<div align="center">
  <br />
  <a href="https://musicale.tk">Official Instance</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://discord.gg/2AJa7nUAUT">Discord</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/Bellisario/musicale/issues">Issues</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/sponsors/Bellisario">Support Development</a>
  <br />
</div>

<br />

Musicale is a music player for the web. It's built with Svelte, Vite and TypeScript for the best user and dev experience.

> Try it on [musicale.tk](https://musicale.tk)

## Features

- Simple and clean UI
- Search musics and preview their thumbnail
- Click on a result to play in a snap
- App loads fully offline (with SW) _(note results and music playing requires an internet connection)_
- Frequency bars with a click _(YouTube Music doesn't have this feature)_
- Favorite musics (with local storage and shuffle option + import/export on settings)
- Free server on the Edge (thanks to [Deno Deploy](https://deno.com/deploy))

Why don't see any photo?

> Because you can see and try by yourself on https://musicale.tk

## Why?

Today music players are slow (also on loading) and interrupt you with ads audios if free or let you pay for a premium account.

Musicale is a free and open source alternative to those players and streams music from YouTube Music _(through a third party API)_.

## API

The interesting thing about Musicale is that there is no backend and the API it's from [Piped](https://github.com/TeamPiped/Piped) (a privacy-friendly alternative YouTube frontend), which is well documented [here](https://piped-docs.kavin.rocks/).

## Development

To get started, make sure to have Git and Node.js (>= 16.0.0) installed.

Clone the repo and `cd` it:

```bash
git clone https://github.com/Bellisario/musicale.git && cd musicale
```

Install dependencies:
```bash
npm install
```

Then, you can run the following command to start the server (in DEV mode):

```bash
npm run dev
```

After done, to build the project run:

```bash
npm run build
```

> **Info:** we're using [Deno Deploy](https://deno.com/deploy) as server hosting so all the build files will go inside `dist/public` and not `dist`.\
> (This behavior may change in the future)

If you want to preview the build run:

```bash
npm run preview
```

Before opening a pull, please make sure to run `npm run check` to check for warnings, errors, etc. and format your code with VSCode (Svelte extension).

## Contributing

We :heart: contributions!\
Feel free to open an [issue](https://github.com/Bellisario/musicale/issues) or a [pull request](https://github.com/Bellisario/musicale/pulls) but follow [Contributing Guidelines](https://github.com/Bellisario/musicale/blob/main/CONTRIBUTING.md).

> **Tip:** if you don't know where to start, check out the [help wanted issues](https://github.com/Bellisario/musicale/labels/help%20wanted)!


## Legal

We do NOT host or scrape any Youtube Music content, we use a PUBLIC available API to provide user a playable URL of the music through a good-looking interface, WITHOUT violating any laws.

Musicale is NOT affiliated with Piped, YouTube, YouTube Music or Google in any way. All the content played on Musicale is offered by third parties and is NOT hosted by Musicale.

If you suspect a violation of your rights, you should contact the respective third party providers.

> **Note:** Musicale uses Piped as API but servers used may NOT be affiliated with Piped itself.

## License

MIT License [here](https://github.com/Bellisario/musicale/blob/main/LICENSE).
