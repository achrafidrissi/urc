import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAppDispatch } from "@/app/hooks"
import { authStart, authSuccess, authFailure } from "./authSlice"

export default function RegisterPage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        login: "",
        email: "",
        password: "",
    })

    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        dispatch(authStart())

        try {
            if (!form.login || !form.email || !form.password) {
                throw new Error("Tous les champs sont obligatoires")
            }

            // ⚡ Appel au service d’inscription
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })

            if (!res.ok) {
                const { message } = await res.json()
                throw new Error(message || "Erreur lors de l'inscription")
            }

            const data = await res.json()

            // soit tu connectes automatiquement
            navigate("/login")
            alert("Compte créé avec succès ! Vous pouvez maintenant vous connecter.")

        } catch (err: any) {
            setError(err.message)
            dispatch(authFailure(err.message))
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[350px] shadow-xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Créer un compte</CardTitle>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="login">Login</Label>
                            <Input
                                id="login"
                                name="login"
                                placeholder="Nom d'utilisateur"
                                value={form.login}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="email@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="********"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-2">
                        <Button type="submit" className="w-full">
                            S'inscrire
                        </Button>
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => navigate("/login")}
                        >
                            Déjà un compte ? Se connecter
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
