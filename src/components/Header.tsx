export function Header() {
  return (
    <header className="pt-safe sticky top-0 z-30 bg-ink-50/80 backdrop-blur-xl">
      <div className="flex items-baseline justify-between px-5 pb-3 pt-3">
        <div>
          <h1 className="font-serif text-2xl tracking-wide text-ink-900">西湖</h1>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.25em] text-ink-400">
            xihu · ai native
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] tracking-wider text-ink-400">
            {formatDate()}
          </p>
          <p className="mt-0.5 text-[11px] tracking-wider text-ink-400">
            晴 · 22°
          </p>
        </div>
      </div>
    </header>
  )
}

function formatDate() {
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
