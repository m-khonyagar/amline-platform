import { useEffect, useState } from 'react'

export default function LeadsPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch('http://localhost:9010/api/v1/advisor/leads')
      .then(r => r.json())
      .then(d => setItems(d.items || []))
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h1>CRM مشاور</h1>
      <a href="/leads/new">+ افزودن لید</a>

      {items.map((l:any) => (
        <div key={l.id} style={{ border: '1px solid #ddd', padding: 12, marginTop: 10 }}>
          <p><b>{l.name}</b></p>
          <p>{l.phone}</p>
          <p>وضعیت: {l.status}</p>
          <a href={`/leads/${l.id}`}>مشاهده</a>
        </div>
      ))}
    </div>
  )
}
