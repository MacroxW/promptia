import { registerSchema, type RegisterInput } from '@promptia/schemas'
import { useAuth } from "~/hooks/useAuth";
import { Input } from "../components/Input";
import { useFormValidation } from "../hooks/useFormValidation";

const RegisterPage = () => {
    const { register, isLoading } = useAuth();

    // Hook de validación de formularios
    const { values, errors, setValue, validate } = useFormValidation<RegisterInput>({
        email: '',
        password: '',
        name: ''
    });

    const handleSubmit = async () => {
        // Validar formulario
        const isValid = await validate(registerSchema);

        if (isValid) {
            try {
                await register(values);
            } catch (error: any) {
                alert(error?.message || "Error en el registro");
                console.log("Error de registro", error);
            }
        }
    };

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
                            value={values.name || ''}
                            onChange={(e) => setValue('name', e.target.value)}
                            placeholder="John Doe"
                            error={errors.name}
                        />

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
                            {isLoading ? "Signing up..." : "Sign Up"}
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
