import { type LoginInput, type RegisterInput } from "@promptia/schemas";


const URL_API = "http://localhost:4000"

export async function loginService(data: LoginInput) {
    const res = await fetch(`${URL_API}/auth/login`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify(data)
        }
    )
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Credenciales incorrectas")
    }
    return res.json()
}

export async function registerService(data: RegisterInput) {
    const res = await fetch(`${URL_API}/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        }
    )
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Error en el registro")
    }
    return res.json()
}