import {COUNTRIES} from '@/pages/explore/data/countries';
import {createCountryMapDocument} from '@/pages/explore/maps/country-map-document';

export function GET(request: Request) {
    const parameters = new URL(request.url).searchParams;
    const selectedCode = parameters.get('country');
    const channel = parameters.get('channel') ?? '';
    if (!/^[\w:-]{1,100}$/.test(channel)) {
        return new Response('Invalid map channel.', {status: 400});
    }
    const html = createCountryMapDocument({
        apiKey: process.env.GOOGLE_MAPS_API_KEY?.trim() ?? '',
        mapId: process.env.GOOGLE_MAPS_MAP_ID?.trim() ?? '',
        channel,
        dark: parameters.get('theme') === 'dark',
        initialCountry: COUNTRIES.find(country => country.code === selectedCode) ?? null,
    });
    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
