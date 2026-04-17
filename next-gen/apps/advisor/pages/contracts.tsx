import { useEffect, useState } from 'react'

export default function AdvisorContracts() {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch('http://localhost:9002/api/v1/contracts')
      .then(r => r.json())
      .then(d => setItems(d.items || []))
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h1>قراردادهای مشاور</h1>
      {items.map((c:any) => (
        <div key={c.id} style={{ border: '1px solid #ddd', marginBottom: 8, padding: 12 }}>
          <p>{c.id}</p>
          <p>{c.status}</p>
        </div>
      ))}
    </div>
  )
}
