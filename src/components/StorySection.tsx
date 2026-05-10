import { stories } from '../data/stories'

type Props = {
  onAskAI: (seed: string) => void
}

export function StorySection({ onAskAI }: Props) {
  return (
    <section className="mt-12 animate-fade-up">
      <div className="mb-5 flex items-baseline justify-between px-5">
        <h3 className="font-serif text-xl text-ink-900">湖边故事</h3>
        <span className="text-[11px] uppercase tracking-[0.25em] text-ink-400">
          stories
        </span>
      </div>
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => onAskAI(`讲讲 "${story.title}" 的细节，要带原始时空感。`)}
            className="snap-start shrink-0 basis-[78%] rounded-2xl border border-ink-200 bg-white p-6 text-left transition active:bg-ink-100"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
              {story.era}
            </p>
            <h4 className="mt-2 font-serif text-xl text-ink-900">
              {story.title}
            </h4>
            <p className="mt-1 text-[11px] tracking-wider text-ink-500">
              {story.anchor}
            </p>
            <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-ink-600">
              {story.excerpt}
            </p>
            <p className="mt-5 text-[11px] tracking-wider text-ink-400">
              tap · 让 AI 接着讲 →
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}
