import {createContext, useContext, useState, type PropsWithChildren} from 'react';

import {TRIPS} from '@/pages/explore/data/trips';

type TripId = typeof TRIPS[number]['id'];
const ActiveTripContext = createContext<{
    activeTripId: TripId | null;
    startTrip: (id: TripId) => void;
} | null>(null);

export function ActiveTripProvider({children}: PropsWithChildren) {
    const [activeTripId, setActiveTripId] = useState<TripId | null>(null);
    return <ActiveTripContext.Provider value={{activeTripId, startTrip: setActiveTripId}}>
        {children}
    </ActiveTripContext.Provider>;
}

export function useActiveTrip() {
    const context = useContext(ActiveTripContext);
    if (!context) throw new Error('useActiveTrip must be used within ActiveTripProvider');
    return context;
}
