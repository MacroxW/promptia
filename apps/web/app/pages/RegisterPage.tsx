import { useState } from "react";
import { registerSchema, type RegisterInput } from '@promptia/schemas'
import { useAuth } from "~/hooks/useAuth";
import { Input } from "../components/Input";

const RegisterPage = () => {
    const { register, isLoading, error } = useAuth();

    const [formValues, setFormValues] = useState<RegisterInput>({
        email: '',
        password: '',
        name: ''
    })

    const setValue = (key: keyof RegisterInput, val: string) => {
        setFormValues({ ...formValues, [key]: val })
    }

    const handleSubmit = async () => {
        try {
            await registerSchema.parseAsync(formValues)
            await register(formValues)
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message)
            } else {
                alert("Error en el registro")
            }
            console.log("Error de validacion o registro", error)
        }
    }

    return (
        <div className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Create Account
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Join Promptia today
                        </p>
                    </div>

                    <div className="space-y-6">
                        <Input
                            label="Name (Optional)"
                            type="text"
                            value={formValues.name || ''}
                            onChange={(e) => setValue('name', e.target.value)}
                            placeholder="John Doe"
                        />

                        <Input
                            label="Email"
                            type="email"
                            value={formValues.email}
                            onChange={(e) => setValue('email', e.target.value)}
                            placeholder="tu@email.com"
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={formValues.password}
                            onChange={(e) => setValue('password', e.target.value)}
                            placeholder="••••••••"
                        />

                        <button
                            onClick={handleSubmit}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account? <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign in</a>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default RegisterPage
