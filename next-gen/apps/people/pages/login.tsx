import { useState } from 'react'

export default function Login() {
  const [phone, setPhone] = useState('')

  return (
    <div className="container" dir="rtl">
      <div className="card">
        <h2>ورود به املاین</h2>
        <p>شماره موبایل خود را وارد کنید</p>

        <input
          className="input"
          placeholder="0912..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button className="button" style={{ marginTop: 16 }}>
          دریافت کد
        </button>
      </div>
    </div>
  )
}
