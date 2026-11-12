import {COUNTRIES} from './countries';
import type {TripTypeId} from './trip-types';

export type Trip = {
    id: string;
    name: string;
    countryCodes: readonly (typeof COUNTRIES[number]['code'])[];
    route: string;
    durationDays: number;
    typeId: TripTypeId;
    totalPrice: number;
    currency: 'USD';
};

// Illustrative total budgets per person, including stays, meals, activities,
// and transport within the itinerary. Travel to and from the starting point is excluded.
export const TRIPS = [
    {id: 'japan-classics', name: 'Japan cultural highlights', countryCodes: ['JP'], route: 'Tokyo · Kyoto · Osaka', durationDays: 10, typeId: 'culture', totalPrice: 2400, currency: 'USD'},
    {id: 'bali-beaches', name: 'Bali beach escape', countryCodes: ['ID'], route: 'Sanur · Nusa Dua', durationDays: 7, typeId: 'relaxation', totalPrice: 850, currency: 'USD'},
    {id: 'dolomites-hiking', name: 'Hiking the Dolomites', countryCodes: ['IT'], route: 'Cortina · Val Gardena', durationDays: 6, typeId: 'active', totalPrice: 1350, currency: 'USD'},
    {id: 'thai-flavors', name: 'A taste of Thailand', countryCodes: ['TH'], route: 'Bangkok · Chiang Mai', durationDays: 8, typeId: 'food', totalPrice: 1100, currency: 'USD'},
    {id: 'costa-rica-wildlife', name: 'Costa Rica wildlife trails', countryCodes: ['CR'], route: 'Tortuguero · Arenal · Monteverde', durationDays: 12, typeId: 'wildlife', totalPrice: 2650, currency: 'USD'},
    {id: 'ubud-wellness', name: 'Ubud wellness retreat', countryCodes: ['ID'], route: 'Ubud', durationDays: 5, typeId: 'wellness', totalPrice: 950, currency: 'USD'},
    {id: 'great-ocean-road', name: 'Great Ocean Road getaway', countryCodes: ['AU'], route: 'Melbourne · Apollo Bay · Port Campbell', durationDays: 3, typeId: 'road-trip', totalPrice: 620, currency: 'USD'},
    {id: 'europe-by-road', name: 'Alpine roads and lakes', countryCodes: ['DE', 'AT', 'IT'], route: 'Munich · Innsbruck · Lake Garda', durationDays: 9, typeId: 'road-trip', totalPrice: 2100, currency: 'USD'},
    {id: 'portugal-culture', name: 'Lisbon city break', countryCodes: ['PT'], route: 'Lisbon · Sintra', durationDays: 3, typeId: 'culture', totalPrice: 480, currency: 'USD'},
    {id: 'new-zealand-active', name: 'New Zealand outdoor explorer', countryCodes: ['NZ'], route: 'Queenstown · Wanaka · Fiordland', durationDays: 16, typeId: 'active', totalPrice: 3900, currency: 'USD'},
    {id: 'greece-islands', name: 'Greek island unwind', countryCodes: ['GR'], route: 'Naxos · Paros', durationDays: 10, typeId: 'relaxation', totalPrice: 1750, currency: 'USD'},
    {id: 'tanzania-safari', name: 'Serengeti safari', countryCodes: ['TZ'], route: 'Arusha · Serengeti · Ngorongoro', durationDays: 7, typeId: 'wildlife', totalPrice: 3200, currency: 'USD'},
] as const satisfies readonly Trip[];
