import { useState } from "react";
import { loginSchema, type LoginInput }  from '@promptia/schemas'
import { loginService } from "~/services/auth.service";
 
const LoginPage = () => {

    const [formValues, setFormValues] = useState<LoginInput>({
        email: '',
        password: ''
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
            window.location.href ="/"

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
    

    return (<div className="max-w-sm mx-auto mt-10 p-5 border rounded shadow">

        <div aria-label="form-input">
            <label>
                Email
            </label>
            <input type="email" value={formValues.email} onChange={(v) => setValue('email', v.target.value)}  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"/>

        </div>
        <div aria-label="form-input">
            <label>
                Password
            </label>
            <input type="password" value={formValues.password} onChange={(v) => setValue('password', v.target.value)} className="border border-gray-300 rounded p-2 w-full mt-1 text-white"/>
        </div>

        <button onClick={ handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded mt-4" >
            Submit
        </button>


    </div>
    )
};

export default LoginPage