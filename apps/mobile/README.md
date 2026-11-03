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

## Google Maps country picker

Explore offers both a searchable country list and a **Choose on map** action.
Tapping a country highlights its boundaries; **Select country** applies it to the
existing filter. Closing the map discards an unconfirmed selection. Loading and
configuration failures leave the list picker available.

If Google country boundaries or the vector renderer are unavailable, the map
automatically loads a local Natural Earth polygon layer. This supports hover and
selection on raster maps too. The fallback uses generalized outlines for 236
ISO country codes; smaller territories without polygons remain available in the
list. The map labels this boundary source. See `public/data/README.md` for its
public-domain license and source. All polygons sharing an ISO code are combined
to keep mainland and island territories interactive together.

The same Google Maps JavaScript map is used in a browser iframe and in
`react-native-webview` on Android/iOS. The HTML is served by the Expo API route
`/country-map`, so Google receives a real website origin rather than a local HTML
document. API routes require the existing `web.output: "server"` configuration
and a running Expo server in development or a server deployment in production.

1. In Google Cloud, enable billing, **Maps JavaScript API**, and **Geocoding API**.
2. Create a **JavaScript vector Map ID**, create a cloud map style with the
   **Country (`COUNTRY`)** boundary feature layer enabled, and associate the style
   with that Map ID.
3. Copy `.env.example` to `.env.local` and set `GOOGLE_MAPS_API_KEY` and
   `GOOGLE_MAPS_MAP_ID`. These are read by the server route. The key is delivered
   to the browser to load Google Maps; it is a browser key, not a server secret.
   Restrict it to the map website's HTTP referrers and the two enabled APIs.
4. For Android/iOS, set `EXPO_PUBLIC_GOOGLE_MAPS_WEB_ORIGIN` to the origin serving
   this application, such as `https://travel.example.com`. During local testing,
   use a device-reachable development server address, such as
   `http://192.168.1.10:8081`, and configure the key's referrer restrictions
   accordingly. `localhost` on a physical phone refers to the phone itself.
   The browser uses its current origin and does not need this variable.
5. Restart Expo after changing environment variables. Set the server variables
   on the production hosting environment too, and rebuild native bundles after
   changing the public origin. Existing custom native development builds may
   need rebuilding to include the new WebView dependency; Expo Go includes it.

No Google requests are made until the map is opened. With Google's COUNTRY layer,
selection uses Geocoding to translate a boundary's place ID to the same ISO code
used by the list. The local fallback already has ISO codes and needs no Geocoding
requests for clicks or hovering.
Requests are limited to explicit taps or restoring the previously selected
country; newer taps supersede pending selections. Map and Geocoding usage follow
Google Maps Platform billing.

Useful documentation:

- [Enable country boundary styling](https://developers.google.com/maps/documentation/javascript/dds-boundaries/start)
- [Handle boundary clicks](https://developers.google.com/maps/documentation/javascript/dds-boundaries/handle-events)
- [Enable Geocoding](https://developers.google.com/maps/documentation/javascript/geocoding)
- [Expo API routes](https://docs.expo.dev/router/web/api-routes/)

Run the map regression checks with:

```bash
node scripts/country-map.test.cjs
```
