import { useEffect, useState } from 'react'

export default function ReviewQueue() {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch('http://localhost:9002/api/v1/contracts')
      .then(r => r.json())
      .then(d => setItems(d.items || []))
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h1>صف بررسی قراردادها</h1>
      {items.map((c:any) => (
        <div key={c.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 8 }}>
          <p>ID: {c.id}</p>
          <p>Status: {c.status}</p>
          <button>تایید</button>
          <button>رد</button>
        </div>
      ))}
    </div>
  )
}
