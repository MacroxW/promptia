import { useState } from "react";
import { loginSchema, type LoginInput } from '@promptia/schemas'
import { loginService } from "~/services/auth.service";
import { Input } from "../components/Input";

const LoginPage = () => {

    const [formValues, setFormValues] = useState<LoginInput>({
        email: 'user@gmail.com',
        password: 'password12345'
    })

    const setValue = (key: keyof LoginInput, val: string) => {
        setFormValues({ ...formValues, [key]: val })
    }

    /*
    const validateForm = () => {
        loginSchema.parseAsync(formValues) // tira error si los datos estan mal
            .then(console.log)
            .catch(console.log)
    }
    */

    const handleSubmit = async () => {
        try {
            await loginSchema.parseAsync(formValues)
            console.log("El formato es valido", formValues)

            const data = await loginService(formValues)
            localStorage.setItem("token", data.token)
            window.location.href = "/"

            //----PROBANDO QUE ANDE SIN EL BACKEND ----//

            /*
            console.log("Simulando login SIN backend...");
            localStorage.setItem("token", "token-falso-123");
            //window.location.href = "/home";
            return;
            */

        } catch (error) {
            alert("Formato de datos incorrecto")
            console.log("Error de validacion", error)
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
                            Sign In
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account? <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign up</a>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default LoginPage