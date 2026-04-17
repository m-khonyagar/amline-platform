import { useState } from 'react'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState(null)

  const handleLogin = async () => {
    const res = await fetch('http://localhost:9001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    })
    const data = await res.json()
    setResult(data)
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>ورود</h2>
      <input
        placeholder="شماره موبایل"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button onClick={handleLogin}>دریافت کد</button>

      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  )
}
