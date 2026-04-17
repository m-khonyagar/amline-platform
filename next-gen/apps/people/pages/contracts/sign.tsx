import { useState } from 'react'

export default function SignPage() {
  const [contractId, setContractId] = useState('')
  const [otp, setOtp] = useState('')
  const [result, setResult] = useState(null)

  const sign = async () => {
    const res = await fetch(`http://localhost:9002/api/v1/contracts/${contractId}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'tenant', otp })
    })
    setResult(await res.json())
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>امضای قرارداد</h1>
      <input placeholder="contract id" value={contractId} onChange={(e)=>setContractId(e.target.value)} />
      <input placeholder="OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} />
      <button onClick={sign}>امضا</button>

      {result && <pre>{JSON.stringify(result,null,2)}</pre>}
    </div>
  )
}
