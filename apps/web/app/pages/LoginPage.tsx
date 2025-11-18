import { useState } from "react";
import { loginSchema, type LoginInput }  from '@promptia/schemas'
 
const LoginPage = () => {

    const [formValues, setFormValues] = useState<LoginInput>({
        email: '',
        password: ''
    })

    const setValue = (key: keyof LoginInput, val: string) => {
        setFormValues({ ...formValues, [key]: val })
    }

    const validateForm = () => {
        loginSchema.parseAsync(formValues)
            .then(console.log)
            .catch(console.log)
    }

    return (<div>

        <div aria-label="form-input">
            <label>
                Email
            </label>
            <input type="text" value={formValues.email} onChange={(v) => setValue('email', v.target.value)} />

        </div>
        <div aria-label="form-input">
            <label>
                Password
            </label>
            <input type="text" value={formValues.password} onChange={(v) => setValue('password', v.target.value)} />
        </div>

        <button onClick={() => validateForm()} >
            Submit
        </button>


    </div>
    )
};

export default LoginPage