// Base URL for all API calls — backend running on port 5001
const BASE_URL = 'http://localhost:5001/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('doctech_token')
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  getMe:    ()     => request('/auth/me'),
}

export default request
