import { useState } from "react";
import { type LoginInput, type RegisterInput } from "@promptia/schemas";
import { useNavigate } from "react-router";

const URL_API = "http://localhost:4000";

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const login = async (data: LoginInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${URL_API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Credenciales incorrectas");
            }

            const response = await res.json();
            localStorage.setItem("token", response.token);
            navigate("/chat", { replace: true });
            window.dispatchEvent(new Event("auth-change"));

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error en el login";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${URL_API}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Error en el registro");
            }

            const response = await res.json();

            if (response.token) {
                localStorage.setItem("token", response.token);
                navigate("/chat", { replace: true });
            } else {
                navigate("/login", { replace: true });
            }

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error en el registro";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
    };

    const isAuthenticated = () => {
        return !!localStorage.getItem("token");
    };

    return {
        login,
        register,
        logout,
        isAuthenticated,
        isLoading,
        error
    };
};
