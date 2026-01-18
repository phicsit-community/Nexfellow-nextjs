'use client';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './slices/userSlice';

const persistConfig = {
    key: 'user',
    storage,
    whitelist: ['user', 'token', 'expiresIn'],
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);

export const makeStore = () => {
    return configureStore({
        reducer: {
            user: persistedUserReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                    ignoredPaths: ['user._persist'],
                },
            }),
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
