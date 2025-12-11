import { useState, useEffect } from "react";
import { type LoginInput, type RegisterInput } from "@promptia/schemas";
import { useNavigate } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token);
            setIsCheckingAuth(false);
        };

        checkAuth();
        window.addEventListener("auth-change", checkAuth);
        return () => window.removeEventListener("auth-change", checkAuth);
    }, []);

    const login = async (data: LoginInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
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
            const res = await fetch(`${API_URL}/auth/register`, {
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
        setIsAuthenticated(false);
        window.dispatchEvent(new Event("auth-change"));
        navigate("/login", { replace: true });
    };

    return {
        login,
        register,
        logout,
        isAuthenticated,
        isCheckingAuth,
        isLoading,
        error
    };
};
