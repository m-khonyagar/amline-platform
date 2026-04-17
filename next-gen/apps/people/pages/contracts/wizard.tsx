import { useMemo, useState } from 'react'

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

const box = {
  background: '#fff',
  borderRadius: 12,
  padding: 20,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
} as const

export default function ContractWizard() {
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
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

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step])

  const validateStep = () => {
    if (step === 2 && (!form.ownerName || !form.tenantName)) {
      setError('نام مالک و مستاجر را کامل کنید')
      return false
    }
    if (step === 3 && !form.propertyAddress) {
      setError('آدرس ملک الزامی است')
      return false
    }
    if (step === 4 && (!form.startDate || !form.endDate)) {
      setError('تاریخ شروع و پایان را وارد کنید')
      return false
    }
    if (step === 5 && (!form.deposit || !form.rent)) {
      setError('شرایط مالی را کامل کنید')
      return false
    }
    setError('')
    return true
  }

  const next = () => {
    if (!validateStep()) return
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const saveDraft = async () => {
    setSaving(true)
    setSaved(false)
    await fetch('http://localhost:9002/api/v1/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creator_phone: '09120000000',
        parties: [
          { role: 'owner', full_name: form.ownerName || 'مالک', phone: '09120000001' },
          { role: 'tenant', full_name: form.tenantName || 'مستاجر', phone: '09120000002' }
        ],
        form,
        status: 'draft'
      })
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="container" dir="rtl" style={{ maxWidth: 1100 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={box}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h1 style={{ margin: 0 }}>ایجاد قرارداد جدید</h1>
              <p style={{ marginTop: 8, color: '#6B7280' }}>مرحله {step + 1} از {steps.length} — {steps[step]}</p>
            </div>
            <span style={{ background: '#ECFDF5', color: '#0F766E', padding: '8px 12px', borderRadius: 999 }}>پیش نویس</span>
          </div>

          <div style={{ height: 8, background: '#E5E7EB', borderRadius: 999, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#0F766E' }} />
          </div>

          {step === 0 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <label>نوع قرارداد</label>
              <select className="input" value={form.contractType} onChange={(e) => setForm({ ...form, contractType: e.target.value })}>
                <option value="rent">رهن و اجاره</option>
                <option value="sale">خرید و فروش</option>
                <option value="exchange">معاوضه</option>
              </select>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <label>نقش ایجادکننده</label>
              <select className="input" value={form.creatorRole} onChange={(e) => setForm({ ...form, creatorRole: e.target.value })}>
                <option value="self">اصالتاً</option>
                <option value="representative">وکالتاً</option>
              </select>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <input className="input" placeholder="نام مالک" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
              <input className="input" placeholder="نام مستاجر" value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} />
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <textarea className="input" placeholder="آدرس ملک" value={form.propertyAddress} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} rows={4} />
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              <input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          )}

          {step === 5 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <input className="input" placeholder="مبلغ ودیعه (تومان)" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} />
              <input className="input" placeholder="مبلغ اجاره ماهانه (تومان)" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} />
            </div>
          )}

          {step === 6 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <textarea className="input" placeholder="شروط خاص و توضیحات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={5} />
            </div>
          )}

          {step === 7 && (
            <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB' }}>
              <h3 style={{ marginTop: 0 }}>پیش نمایش نهایی</h3>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{JSON.stringify(form, null, 2)}</pre>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 16, background: '#FEF2F2', color: '#B91C1C', padding: 12, borderRadius: 10 }}>
              {error}
            </div>
          )}

          {saved && (
            <div style={{ marginTop: 16, background: '#ECFDF5', color: '#065F46', padding: 12, borderRadius: 10 }}>
              پیش نویس با موفقیت ذخیره شد.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24 }}>
            <button className="button" onClick={prev} disabled={step === 0} style={{ opacity: step === 0 ? 0.6 : 1 }}>
              قبلی
            </button>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="button" onClick={saveDraft} style={{ background: '#14B8A6' }}>
                {saving ? 'در حال ذخیره...' : 'ذخیره پیش نویس'}
              </button>
              <button className="button" onClick={next} disabled={step === steps.length - 1} style={{ opacity: step === steps.length - 1 ? 0.6 : 1 }}>
                بعدی
              </button>
            </div>
          </div>
        </div>

        <div style={{ ...box, position: 'sticky', top: 24, alignSelf: 'start' }}>
          <h3 style={{ marginTop: 0 }}>خلاصه قرارداد</h3>
          <p><strong>نوع قرارداد:</strong> {form.contractType}</p>
          <p><strong>مالک:</strong> {form.ownerName || '—'}</p>
          <p><strong>مستاجر:</strong> {form.tenantName || '—'}</p>
          <p><strong>آدرس:</strong> {form.propertyAddress || '—'}</p>
          <p><strong>شروع:</strong> {form.startDate || '—'}</p>
          <p><strong>پایان:</strong> {form.endDate || '—'}</p>
          <p><strong>ودیعه:</strong> {form.deposit || '—'}</p>
          <p><strong>اجاره:</strong> {form.rent || '—'}</p>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
            <p style={{ color: '#6B7280', margin: 0 }}>اعتماد و امنیت</p>
            <ul style={{ paddingRight: 18, marginBottom: 0 }}>
              <li>ذخیره مرحله‌ای اطلاعات</li>
              <li>قابلیت امضای آنلاین</li>
              <li>آماده ورود به بررسی حقوقی</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
