import { useEffect, useState } from 'react'

export default function FinanceDashboard() {
  const [data, setData] = useState({ total: 0, contracts: 0 })

  useEffect(() => {
    // fake data for now
    setData({ total: 2500000, contracts: 12 })
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h1>درآمد مشاور</h1>
      <div style={{ marginTop: 20 }}>
        <p>کل درآمد: {data.total.toLocaleString()} تومان</p>
        <p>تعداد قرارداد: {data.contracts}</p>
      </div>
    </div>
  )
}
