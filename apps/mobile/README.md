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
