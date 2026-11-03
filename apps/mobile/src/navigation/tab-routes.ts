import {Compass, House, Map, Settings, UserRound} from 'lucide-react-native';

export const TAB_ROUTES = [
    {name: 'home', href: '/home', title: 'Home', icon: House},
    {name: 'explore', href: '/explore', title: 'Explore', icon: Compass},
    {name: 'journey', href: '/journey', title: 'Journey', icon: Map},
    {name: 'account', href: '/account', title: 'Account', icon: UserRound},
    {name: 'settings', href: '/settings', title: 'Settings', icon: Settings},
] as const;
