# Mobile app

Expo Router application for Android, iOS, and web.

## Development

```bash
pnpm install
pnpm start
pnpm exec tsc --noEmit
pnpm lint
```

## Source layout

- `src/app/`: Expo Router route entry points and the root layout.
- `src/pages/home/`: Home page and its local `components/`.
- `src/pages/explore/`: Explore page and its local `components/`.
- `src/navigation/`: Tab navigation and its splash overlay.
- `src/shared/ui/`: UI primitives used by multiple pages.
- `src/shared/theme/`: Theme provider, hooks, colors, spacing, and system fonts.

Keep page-specific components inside their page directory. Share code only when
multiple pages need it. Keep non-route code outside `src/app/` so Expo Router does
not register components as routes.

Use React Native `StyleSheet.create` and shared theme tokens for styling on all
platforms. Keep runtime values such as theme colors and insets in style arrays.
No CSS files or CSS variables are needed.

The `pnpm reset-project` command replaces the starter application with a blank
route structure. It can optionally move the current source and demo assets into
`example/` first.

## Offline MapLibre country picker

Explore offers a searchable country list and a **Choose on map** action.
Android and iOS use `@maplibre/maplibre-react-native`; web uses `maplibre-gl`.
The map style and Natural Earth country polygons are bundled with the application.
No API keys, map hosting, tile downloads, or network connection are needed to
select a country. The map shows country outlines rather than a street map.

Tap a country to highlight it, then confirm with **Select country**. Closing the
map discards the draft selection. Web also supports hover previews. Small
territories without polygons remain selectable through the list.

Data and license: `src/pages/explore/data/country-boundaries.md`.

MapLibre includes native code and its Expo config plugin is registered in
`app.json`. Rebuild the Android/iOS app after installing dependencies; Expo Go
does not include MapLibre. An OTA JavaScript update cannot add this native module.

```bash
pnpm dlx eas-cli@latest build --platform android --profile production
```

Metro copies MapLibre's module worker and its shared module from the installed
package to `public/vendor/maplibre/<version>/` on startup and export. The web map
sets this local worker URL explicitly; no CDN is used. Restart Expo after changing
Metro configuration or upgrading MapLibre. These generated files are ignored by Git.

No separate Expo API server is required for the map. Web builds still need normal
web hosting; offline loading of the website itself is not configured.

Run map regression checks with:

```bash
node scripts/country-map.test.cjs
node scripts/maplibre-worker.test.cjs
```
