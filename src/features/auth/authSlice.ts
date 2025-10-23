import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type AuthState = {
    token: string | null
    status: 'idle' | 'loading' | 'authenticated' | 'error'
    error?: string
}

const initialState: AuthState = {
    token: typeof window !== 'undefined'
        ? sessionStorage.getItem('token')
        : null,
    status: 'idle',
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authStart(state) {
            state.status = 'loading'
            state.error = undefined
        },
        authSuccess(state, action: PayloadAction<string>) {
            state.status = 'authenticated'
            state.token = action.payload
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('token', action.payload)
            }
        },
        authFailure(state, action: PayloadAction<string>) {
            state.status = 'error'
            state.error = action.payload
            state.token = null
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('token')
            }
        },
        logout(state) {
            state.status = 'idle'
            state.token = null
            state.error = undefined
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('token')
            }
        },
    },
})

export const { authStart, authSuccess, authFailure, logout } = authSlice.actions
export default authSlice.reducer
