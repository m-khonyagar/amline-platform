import { useEffect, useState } from 'react'

export default function Contracts() {
  const [contracts, setContracts] = useState([])

  useEffect(() => {
    fetch('http://localhost:9002/api/v1/contracts')
      .then((res) => res.json())
      .then((data) => setContracts(data.items || []))
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h2>قراردادها</h2>
      {contracts.length === 0 && <p>هیچ قراردادی وجود ندارد</p>}
      <ul>
        {contracts.map((c: any) => (
          <li key={c.id}>{c.id}</li>
        ))}
      </ul>
    </div>
  )
}
