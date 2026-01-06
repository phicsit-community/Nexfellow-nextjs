import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    user: string | null;
    token: string | null;
    expiresIn: string | null;
}

const initialState: UserState = {
    user: null,
    token: null,
    expiresIn: null,
};

interface SetUserPayload {
    user: string;
    token: string;
    expiresIn: string;
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<SetUserPayload>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.expiresIn = action.payload.expiresIn;
        },
        clearUser: (state) => {
            state.user = null;
            state.token = null;
            state.expiresIn = null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
