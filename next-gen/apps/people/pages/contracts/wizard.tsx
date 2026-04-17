import { useState } from 'react'

const steps = [
  'نوع قرارداد',
  'نقش ایجادکننده',
  'طرفین قرارداد',
  'مشخصات ملک',
  'شرایط زمانی',
  'شرایط مالی',
  'شهود و شروط خاص',
  'پیش نمایش'
]

export default function ContractWizard() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    contractType: 'rent',
    creatorRole: 'self',
    ownerName: '',
    tenantName: '',
    propertyAddress: '',
    startDate: '',
    endDate: '',
    deposit: '',
    rent: '',
    notes: ''
  })
  const [saved, setSaved] = useState(false)

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const saveDraft = async () => {
    setSaved(false)
    await fetch('http://localhost:9002/api/v1/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status: 'draft' })
    })
    setSaved(true)
  }

  return (
    <div style={{ padding: 40, maxWidth: 720, margin: '0 auto' }}>
      <h1>ویزارد قرارداد</h1>
      <p>مرحله {step + 1} از {steps.length}: {steps[step]}</p>

      {step === 0 && (
        <select value={form.contractType} onChange={(e) => setForm({ ...form, contractType: e.target.value })}>
          <option value="rent">رهن و اجاره</option>
          <option value="sale">خرید و فروش</option>
          <option value="exchange">معاوضه</option>
        </select>
      )}

      {step === 1 && (
        <select value={form.creatorRole} onChange={(e) => setForm({ ...form, creatorRole: e.target.value })}>
          <option value="self">اصالتاً</option>
          <option value="representative">وکالتاً</option>
        </select>
      )}

      {step === 2 && (
        <div style={{ display: 'grid', gap: 12 }}>
          <input placeholder="نام مالک" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
          <input placeholder="نام مستاجر" value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} />
        </div>
      )}

      {step === 3 && (
        <textarea placeholder="آدرس ملک" value={form.propertyAddress} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} />
      )}

      {step === 4 && (
        <div style={{ display: 'grid', gap: 12 }}>
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </div>
      )}

      {step === 5 && (
        <div style={{ display: 'grid', gap: 12 }}>
          <input placeholder="مبلغ ودیعه" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} />
          <input placeholder="مبلغ اجاره" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} />
        </div>
      )}

      {step === 6 && (
        <textarea placeholder="شروط خاص و توضیحات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      )}

      {step === 7 && (
        <pre style={{ background: '#f5f5f5', padding: 16 }}>{JSON.stringify(form, null, 2)}</pre>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={prev} disabled={step === 0}>قبلی</button>
        <button onClick={next} disabled={step === steps.length - 1}>بعدی</button>
        <button onClick={saveDraft}>ذخیره پیش نویس</button>
      </div>

      {saved && <p style={{ color: 'green' }}>پیش نویس ذخیره شد</p>}
    </div>
  )
}
