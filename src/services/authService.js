const backendUrl = import.meta.env.VITE_BACKEND_URL || ''

async function request(path, options = {}) {
   const response = await fetch(`${backendUrl}${path}`, {
       ...options,
       credentials: 'include',
       headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
   })
   let payload = null
   try { payload = await response.json() } catch { payload = null }
   if (!response.ok) {
       const error = new Error(payload?.message || 'No fue posible completar la solicitud.')
       error.status = response.status
       throw error
   }
   return payload
}

export async function loginUser(credentials) {
   return request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
}

export function registerUser(credentials) {
   return request('/api/auth/register', { method: 'POST', body: JSON.stringify(credentials) })
}
export function getCurrentUser() { return request('/api/auth/me') }
export function logoutUser() { return request('/api/auth/logout', { method: 'POST' }) }
export function requestRecovery(email) {
   return request('/api/auth/recovery', { method: 'POST', body: JSON.stringify({ email }) })
}
export function resetPassword(credentials) {
   return request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(credentials) })
}
