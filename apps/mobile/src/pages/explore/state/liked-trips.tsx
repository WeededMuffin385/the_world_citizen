import {createContext, useContext, useState, type PropsWithChildren} from 'react';

const LikedTripsContext = createContext<{
    likedIds: readonly string[];
    toggleLike: (id: string) => void;
} | null>(null);

export function LikedTripsProvider({children}: PropsWithChildren) {
    const [likedIds, setLikedIds] = useState<string[]>([]);
    function toggleLike(id: string) {
        setLikedIds(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
    }
    return <LikedTripsContext.Provider value={{likedIds, toggleLike}}>{children}</LikedTripsContext.Provider>;
}

export function useLikedTrips() {
    const context = useContext(LikedTripsContext);
    if (!context) throw new Error('useLikedTrips must be used within LikedTripsProvider');
    return context;
}
