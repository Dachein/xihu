import { Footprints, Wand2 } from 'lucide-react'
import { routes } from '../data/routes'

type Props = {
  onAskAI: (seed: string) => void
}

export function RouteSection({ onAskAI }: Props) {
  return (
    <section className="mt-12 animate-fade-up">
      <div className="mb-5 flex items-baseline justify-between px-5">
        <h3 className="font-serif text-xl text-ink-900">半日漫游</h3>
        <span className="text-[11px] uppercase tracking-[0.25em] text-ink-400">
          routes
        </span>
      </div>

      <div className="space-y-3 px-5">
        {routes.map((route) => (
          <article
            key={route.id}
            className="rounded-2xl border border-ink-200 bg-white p-6"
          >
            <div className="flex items-baseline justify-between">
              <h4 className="font-serif text-lg leading-snug text-ink-900">
                {route.title}
              </h4>
            </div>
            <div className="mt-2 flex gap-3 text-[11px] tracking-wider text-ink-400">
              <span className="inline-flex items-center gap-1">
                <Footprints size={11} />
                {route.duration}
              </span>
              <span>·</span>
              <span>{route.vibe}</span>
            </div>

            <ol className="mt-5 space-y-3">
              {route.stops.map((stop, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-1 font-mono text-[11px] tabular-nums text-ink-400">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-ink-900">{stop.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                      {stop.note}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </article>
        ))}

        <button
          onClick={() =>
            onAskAI('帮我重排一条路线：我想花 3 小时，避开人多的地方，黄昏出发。')
          }
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-300 py-5 text-sm text-ink-600 active:bg-ink-100"
        >
          <Wand2 size={14} />
          <span>让 AI 给我重排一条</span>
        </button>
      </div>
    </section>
  )
}
