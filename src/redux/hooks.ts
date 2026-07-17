import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Hook tipado para despachar acciones al store de Redux
export const useAppDispatch: () => AppDispatch = useDispatch;
// Hook tipado para acceder al estado global de Redux
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
