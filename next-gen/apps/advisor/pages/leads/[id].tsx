import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function LeadDetail() {
  const router = useRouter()
  const { id } = router.query

  const [lead, setLead] = useState<any>(null)

  const load = () => {
    fetch(`http://localhost:9010/api/v1/advisor/leads/${id}`)
      .then(r => r.json())
      .then(setLead)
  }

  useEffect(() => {
    if (id) load()
  }, [id])

  const update = async (status:string) => {
    await fetch(`http://localhost:9010/api/v1/advisor/leads/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    load()
  }

  if (!lead) return <div>Loading...</div>

  return (
    <div style={{ padding: 40 }}>
      <h2>{lead.name}</h2>
      <p>{lead.phone}</p>
      <p>وضعیت: {lead.status}</p>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => update('contacted')}>تماس گرفته شد</button>
        <button onClick={() => update('visit')}>بازدید</button>
        <button onClick={() => update('won')}>موفق</button>
        <button onClick={() => update('lost')}>ناموفق</button>
      </div>
    </div>
  )
}
