import { scenes } from '../data/scenes'

type Props = {
  onOpenScene: (id: string) => void
}

export function SceneList({ onOpenScene }: Props) {
  return (
    <section className="mt-12 animate-fade-up">
      <div className="mb-5 flex items-baseline justify-between px-5">
        <h3 className="font-serif text-xl text-ink-900">西湖十景</h3>
        <span className="text-[11px] uppercase tracking-[0.25em] text-ink-400">
          ten scenes
        </span>
      </div>
      <ul className="space-y-px">
        {scenes.map((scene, i) => (
          <li key={scene.id}>
            <button
              onClick={() => onOpenScene(scene.id)}
              className="flex w-full items-baseline gap-5 px-5 py-5 text-left transition active:bg-ink-100"
            >
              <span className="font-mono text-[11px] tabular-nums text-ink-400">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1 border-b border-ink-200 pb-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="font-serif text-lg text-ink-900">{scene.name}</h4>
                  <span className="shrink-0 text-[11px] uppercase tracking-wider text-ink-400">
                    {scene.season}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">
                  {scene.oneLiner}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
