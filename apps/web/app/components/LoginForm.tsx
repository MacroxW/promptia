import { loginSchema, type LoginInput } from '@promptia/schemas'
import { Input } from "./Input";
import { useFormValidation } from "../hooks/useFormValidation";

interface LoginFormProps {
    onSubmit: (values: LoginInput) => Promise<void>;
    isLoading?: boolean;
}

export const LoginForm = ({ onSubmit, isLoading = false }: LoginFormProps) => {
    
    // Hook de validación del formulario
    const { values, errors, setValue, validate } = useFormValidation<LoginInput>({
        email: 'user@gmail.com',
        password: 'password12345'
    });

    const handleSubmit = async () => {
        // Validar formulario
        const isValid = await validate(loginSchema);

        if (isValid) {
            try {
                await onSubmit(values);
            } catch (error: any) {
                alert(error?.message || "Error en el login");
                console.log("Error de login", error);
            }
        }
    };

    return (
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
                    value={values.email}
                    onChange={(e) => setValue('email', e.target.value)}
                    placeholder="tu@email.com"
                    error={errors.email}
                />

                <Input
                    label="Password"
                    type="password"
                    value={values.password}
                    onChange={(e) => setValue('password', e.target.value)}
                    placeholder="••••••••"
                    error={errors.password}
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
    );
};
