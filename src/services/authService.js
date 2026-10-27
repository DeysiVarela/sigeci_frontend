const backendUrl = import.meta.env.VITE_BACKEND_URL || ''

export async function loginUser(credentials) {
    const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    })

    let payload = null
    try {
        payload = await response.json()
    } catch {
        payload = null
    }

    if (!response.ok) {
        const error = new Error(payload?.message || 'No fue posible iniciar sesión.')
        error.status = response.status
        throw error
    }

    return payload
}
