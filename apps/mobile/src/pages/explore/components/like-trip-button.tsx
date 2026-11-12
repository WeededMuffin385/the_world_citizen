import {Heart} from 'lucide-react-native';
import {Pressable} from 'react-native';

import {useAppTheme} from '@/shared/theme/provider';
import {useLikedTrips} from '../state/liked-trips';

export function LikeTripButton({id, name}: {id: string; name: string}) {
    const {colors} = useAppTheme();
    const {likedIds, toggleLike} = useLikedTrips();
    const liked = likedIds.includes(id);
    return (
        <Pressable accessibilityRole="button" accessibilityLabel={`${liked ? 'Unlike' : 'Like'} ${name}`}
            accessibilityState={{selected: liked}} onPress={event => {event.stopPropagation(); toggleLike(id);}}
            style={({pressed}) => ({width: 44, height: 44, borderRadius: 22, alignItems: 'center',
                justifyContent: 'center', backgroundColor: colors.tabSurface, opacity: pressed ? 0.6 : 1})}>
            <Heart size={22} color={colors.tabTextSelected} fill={liked ? colors.tabTextSelected : 'transparent'} />
        </Pressable>
    );
}
