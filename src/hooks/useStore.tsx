import { useSelector } from 'react-redux';
import { State, User } from '../types/redux';

export function useStore() {
    return useSelector((state: State) => state);
}

export function useUser() {
    return useStore().user as User;
}

export function useSelfId() {
    const user = useUser();
    return (user && user._id) || '';
}

export function useIsLogin() {
    return !!useSelfId();
}
