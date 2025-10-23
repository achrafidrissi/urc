// src/features/users/userSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/app/store'

export interface User {
    user_id: string
    username: string
    last_login: string
}

interface UsersState {
    list: User[]
    selectedUserId: string | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error?: string
}

const initialState: UsersState = {
    list: [],
    selectedUserId: null,
    status: 'idle',
}

// ✅ Thunk pour récupérer la liste des utilisateurs
export const fetchUsers = createAsyncThunk<
    User[], // type de retour
    string, // argument = token
    { rejectValue: string }
>('users/fetchUsers', async (token, { rejectWithValue }) => {
    try {
        const res = await fetch('/api/users', {
            headers: { Authorization: `Bearer ${token}` },
        })

        if (res.status === 401) {
            return rejectWithValue('UNAUTHORIZED')
        }

        if (!res.ok) {
            const text = await res.text()
            throw new Error(text)
        }

        const data: User[] = await res.json()
        return data
    } catch (err: any) {
        return rejectWithValue(err.message)
    }
})

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        selectUser(state, action: PayloadAction<string>) {
            state.selectedUserId = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.list = action.payload
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })
    },
})

export const { selectUser } = usersSlice.actions

export const selectUsers = (state: RootState) => state.users.list
export const selectUsersStatus = (state: RootState) => state.users.status
export const selectSelectedUser = (state: RootState) =>
    state.users.selectedUserId

export default usersSlice.reducer
