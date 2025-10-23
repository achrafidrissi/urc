import { useAppDispatch } from "@/app/hooks"
import { logout } from "@/features/auth/authSlice"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { MessageSquare, LogOut } from "lucide-react"

export default function HomePage() {
    const dispatch = useAppDispatch()

    const handleLogout = () => {
        dispatch(logout())
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100">
            <Card className="w-[400px] shadow-lg border-none">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-2 text-indigo-600">
                        <MessageSquare className="w-10 h-10" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Bienvenue dans la messagerie 🚀
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col items-center gap-4 mt-2">
                    <p className="text-gray-700 text-center">
                        Tu es maintenant connecté.
                        Ici, tu pourras bientôt discuter avec d’autres utilisateurs 🔥
                    </p>

                    <Button
                        variant="destructive"
                        className="flex items-center gap-2 mt-4"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
