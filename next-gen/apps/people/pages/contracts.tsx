import { useEffect, useState } from 'react'

export default function Contracts() {
  const [contracts, setContracts] = useState([])

  useEffect(() => {
    fetch('http://localhost:9002/api/v1/contracts')
      .then((res) => res.json())
      .then((data) => setContracts(data.items || []))
  }, [])

  return (
    <div className="container" dir="rtl">
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>قراردادهای من</h2>
            <p style={{ color: '#6B7280' }}>پیش نویس‌ها، در انتظار امضا، و قراردادهای نهایی شده</p>
          </div>
          <a href="/contracts/wizard" className="button">قرارداد جدید</a>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="card">
          <h3>هنوز قراردادی ندارید</h3>
          <p style={{ color: '#6B7280' }}>اولین قرارداد خود را در چند مرحله ساده ایجاد کنید.</p>
          <a href="/contracts/wizard" className="button">شروع قرارداد جدید</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {contracts.map((c: any) => (
            <div key={c.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{c.id}</strong>
                  <p style={{ margin: '8px 0 0', color: '#6B7280' }}>وضعیت: {c.status}</p>
                </div>
                <a href={`/contracts/sign?contractId=${c.id}`} className="button">ادامه</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
