import { ArrowRight } from 'lucide-react'
import { getNowSuggestion, getSceneById } from '../data/now'

type Props = {
  onOpenScene: (id: string) => void
}

export function NowCard({ onOpenScene }: Props) {
  const now = getNowSuggestion()
  const scene = getSceneById(now.sceneId)

  return (
    <section className="mx-5 animate-fade-up">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-900" />
        <span className="text-[11px] uppercase tracking-[0.25em] text-ink-500">
          now · 此刻
        </span>
      </div>
      <button
        onClick={() => scene && onOpenScene(scene.id)}
        className="group block w-full overflow-hidden rounded-3xl bg-ink-900 p-7 text-left transition active:scale-[0.99]"
      >
        <p className="font-serif text-sm tracking-wider text-ink-400">
          {now.greeting}
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-snug text-ink-50">
          {now.headline}
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-ink-300">
          {now.body}
        </p>
        {scene && (
          <div className="mt-7 flex items-center justify-between border-t border-ink-700 pt-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-ink-500">
                Suggested
              </p>
              <p className="mt-1 font-serif text-base text-ink-100">
                {scene.name}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-50 text-ink-900 transition group-active:translate-x-1">
              <ArrowRight size={16} />
            </div>
          </div>
        )}
      </button>
    </section>
  )
}
