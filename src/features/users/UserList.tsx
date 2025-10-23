// src/features/users/UserList.tsx
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useNavigate } from 'react-router-dom'
import {
    fetchUsers,
    selectUsers,
    selectUsersStatus,
    selectUser,
} from './userSlice'
import { selectAuthToken } from '@/features/auth/authSelectors'

export default function UserList() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const token = useAppSelector(selectAuthToken)
    const users = useAppSelector(selectUsers)
    const status = useAppSelector(selectUsersStatus)

    // TODO: Récupère l'ID ou nom d'utilisateur courant depuis ton slice auth
    const currentUsername = sessionStorage.getItem('username')

    useEffect(() => {
        if (token) dispatch(fetchUsers(token))
    }, [dispatch, token])

    const handleSelectUser = (userId: string) => {
        dispatch(selectUser(userId))
        navigate(`/messages/user/${userId}`)
    }

    if (status === 'loading') return <p>Chargement des utilisateurs...</p>
    if (status === 'failed') return <p>Erreur de chargement.</p>

    return (
        <div className="border-r p-4 w-64">
            <h2 className="text-lg font-semibold mb-3">Utilisateurs</h2>
            <ul className="space-y-2">
                {users
                    .filter((u) => u.username !== currentUsername)
                    .map((user) => (
                        <li
                            key={user.user_id}
                            onClick={() => handleSelectUser(user.user_id)}
                            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                        >
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-gray-500">
                                Dernière connexion : {user.last_login}
                            </div>
                        </li>
                    ))}
            </ul>
        </div>
    )
}
