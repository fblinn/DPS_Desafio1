'use client';

import { Provider } from 'react-redux';
import { store } from '@/redux/store';

// proporciona el store de Redux 
export default function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
