import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { authStart, authSuccess, authFailure } from "./authSlice";
import { selectAuthStatus, selectAuthError } from "./authSelectors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MessageSquare } from "lucide-react";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(authStart());

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Identifiants invalides");

      const data = await res.json();
      dispatch(authSuccess(data.token));
      // Sauvegarder le nom d'utilisateur pour l'affichage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("user_id", data.id);
      }
      dispatch(authSuccess(data.token));
      navigate("/");
    } catch (err: any) {
      dispatch(authFailure(err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <Card className="w-[400px] shadow-lg border-none">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2 text-indigo-600">
            <MessageSquare className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>Accède à ton espace de messagerie</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                placeholder="ex: test"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={status === "loading"}
            >
              {status === "loading" && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {status === "loading" ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="text-center mt-4">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/register")}
                className="text-indigo-600 hover:text-indigo-700"
              >
                Pas encore de compte ? S'inscrire
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
