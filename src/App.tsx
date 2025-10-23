import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectIsAuthenticated } from '@/features/auth/authSelectors'
import LoginPage from '@/features/auth/LoginPage'
import HomePage from "@/features/auth/HomePage";
import RegisterPage from "@/features/auth/RegisterPage";
import UserList from "@/features/users/UserList";

export default function App() {
    const isAuth = useAppSelector(selectIsAuthenticated)

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<UserList />} />
            </Routes>
        </BrowserRouter>
    )
}
