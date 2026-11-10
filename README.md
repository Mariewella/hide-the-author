# Hide the Author

A browser extension for [Martinus.sk](https://www.martinus.sk) and [Martinus.cz](https://www.martinus.cz) that adds extra filters to the bookstore's sidebar: hide books by authors you don't want to see, and show only series or only standalone books.

> Unofficial project. Not affiliated with or endorsed by Martinus.

## Features

- **Hide authors:** type an author's name in the new "Skryť autorov" group in the filter sidebar and press Enter. Their books disappear from the list. Each hidden author appears as a chip, and clicking × shows their books again.
- **Series or standalone:** two new options in the "Zobraziť iba" category show only books that belong to a series, or only standalone books.
- **Active filter badges:** enabled options appear under "Použité filtre", next to the store's own filters, and can be removed from there.
- **Remembers your settings:** hidden authors and selected options are saved in the browser and stay active across pages, reloads and browser restarts.
- **Fits in:** the new controls reuse the store's own styles, so they look like part of the page.
- **Forgiving name matching:** case and diacritics are ignored.

## How to use

1. Open a book listing on Martinus, for example *Beletria*.
2. In the filter sidebar, open **Skryť autorov**, type an author's full name as shown on the book card, and press **Enter**.
3. To show their books again, click **×** on the author's chip.
4. In **Zobraziť iba**, tick **série** or **samostatné knihy**. With neither ticked, all books are shown.

## Privacy

The extension collects no data and sends nothing anywhere. Your settings are stored only in your browser (`storage.local`), and the extension makes no network requests of its own.

## Known limitations

- **Books are hidden, not replaced.** Martinus shows 20 books per page, and the extension only hides books on the page you're viewing.
- **Books from unnumbered series.** A book that belongs to a series without a volume number (for example a novella set in the series' world) counts as standalone if its card doesn't link to the series.
- **Full names only.** An author is hidden only when the whole name matches.
- **Store changes.** The extension depends on the structure of Martinus's pages and may need updating if the store redesigns them.

## Tech stack

- [WXT](https://wxt.dev): web extension framework
- TypeScript
- WebExtensions APIs: content scripts and storage
- `MutationObserver`: keeps the filters working when the store updates the page without a reload

## Project structure

```text
entrypoints/
  content.ts   Content script that runs on Martinus pages: filter UI and hiding logic
  popup/       Toolbar popup (in progress)
utils/
  storage.ts   Saved settings: hidden authors and book types
wxt.config.ts  Extension manifest settings
```

## Development

Requirements: [Node.js](https://nodejs.org) and Firefox or Chrome.

```bash
npm install
npm run dev:firefox   # opens Firefox with the extension loaded
npm run dev           # same for Chrome
npm run compile       # type check
npm run zip:firefox   # build a package for addons.mozilla.org
```

## Roadmap

- [ ] On/off switch in the toolbar popup
- [ ] Remember series information from book detail pages you open
- [ ] Shared list of series corrections maintained in this repository
- [ ] CI with GitHub Actions
- [ ] Publish on Firefox Add-ons, then Chrome and Edge

## Author

Dominika Škulaviková