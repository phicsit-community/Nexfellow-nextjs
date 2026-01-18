'use client';

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import userReducer from '@/slices/userSlice';

// Create a noop storage for SSR
const createNoopStorage = () => {
    return {
        getItem(_key: string) {
            return Promise.resolve(null);
        },
        setItem(_key: string, value: string) {
            return Promise.resolve(value);
        },
        removeItem(_key: string) {
            return Promise.resolve();
        },
    };
};

// Use localStorage only on client side
const storage = typeof window !== 'undefined'
    ? require('redux-persist/lib/storage').default
    : createNoopStorage();

const persistConfig = {
    key: 'user',
    storage,
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
    reducer: {
        user: persistedUserReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                ignoredPaths: ['user._persist'],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
