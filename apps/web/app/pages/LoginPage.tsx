import { useState } from "react";
import { loginSchema, type LoginInput } from '@promptia/schemas'
import { useAuth } from "~/hooks/useAuth";
import { Input } from "../components/Input";
import { ZodError } from "zod";

const LoginPage = () => {
    const { login, isLoading, error } = useAuth();

    const [formValues, setFormValues] = useState<LoginInput>({
        email: 'user@gmail.com',
        password: 'password12345'
    })

    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginInput, string>>>({})

    const setValue = (key: keyof LoginInput, val: string) => {
        setFormValues({ ...formValues, [key]: val })
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (fieldErrors[key]) {
            setFieldErrors({ ...fieldErrors, [key]: undefined })
        }
    }

    const handleSubmit = async () => {
        try {
            setFieldErrors({}) // Limpiar errores previos
            await loginSchema.parseAsync(formValues)
            await login(formValues)
        } catch (error) {
            if (error instanceof ZodError) {
                // Convertir errores de Zod a errores por campo
                const errors: Partial<Record<keyof LoginInput, string>> = {}
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        errors[err.path[0] as keyof LoginInput] = err.message
                    }
                })
                setFieldErrors(errors)
            } else if (error instanceof Error) {
                alert(error.message)
            } else {
                alert("Error en el login")
            }
            console.log("Error de validacion o login", error)
        }
    }

    return (
        <div className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Sign in to your account
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            value={formValues.email}
                            onChange={(e) => setValue('email', e.target.value)}
                            placeholder="tu@email.com"
                            error={fieldErrors.email}
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={formValues.password}
                            onChange={(e) => setValue('password', e.target.value)}
                            placeholder="••••••••"
                            error={fieldErrors.password}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account? <a href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign up</a>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default LoginPage