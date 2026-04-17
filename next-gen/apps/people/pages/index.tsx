export default function Home() {
  return (
    <div className="container" dir="rtl">
      <div className="card">
        <h1>املاین</h1>
        <p>تنظیم و امضای قراردادهای ملکی به صورت آنلاین</p>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <a href="/login" className="button">ورود</a>
          <a href="/contracts" className="button" style={{ background: '#14B8A6' }}>مشاهده قراردادها</a>
        </div>
      </div>
    </div>
  )
}
