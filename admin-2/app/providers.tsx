'use client';

import { useRef, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { makeStore, AppStore } from '@/lib/store/store';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore | null>(null);
    const [isClient, setIsClient] = useState(false);

    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    const persistor = persistStore(storeRef.current);

    return (
        <Provider store={storeRef.current}>
            <PersistGate loading={null} persistor={persistor}>
                <Toaster position="bottom-right" richColors />
                {children}
            </PersistGate>
        </Provider>
    );
}
