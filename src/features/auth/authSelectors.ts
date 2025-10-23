import { RootState } from '@/app/store'

export const selectAuthToken = (s: RootState) => s.auth.token
export const selectAuthStatus = (s: RootState) => s.auth.status
export const selectAuthError  = (s: RootState) => s.auth.error
export const selectIsAuthenticated = (s: RootState) => !!s.auth.token
