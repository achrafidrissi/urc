import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import userReducer from '@/features/users/userSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
    },
})

// Types inferés du store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
