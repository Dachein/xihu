import { X, MapPin, Clock, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import type { Scene } from '../data/scenes'

type Props = {
  scene: Scene | null
  onClose: () => void
  onAskAI: (seed: string) => void
}

export function SceneSheet({ scene, onClose, onAskAI }: Props) {
  useEffect(() => {
    if (!scene) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [scene])

  if (!scene) return null

  return (
    <div className="fixed inset-0 z-50 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="pb-safe absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-ink-50 shadow-2xl"
        style={{ animation: 'fadeUp 0.35s ease-out' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-ink-50/90 px-5 py-3 backdrop-blur">
          <span className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
            {scene.pinyin}
          </span>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 active:bg-ink-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-10">
          <h2 className="font-serif text-4xl leading-tight text-ink-900">
            {scene.name}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            {scene.oneLiner}
          </p>

          <div className="mt-7 rounded-2xl border border-ink-200 bg-white p-6">
            <p className="font-serif text-xl leading-loose text-ink-900">
              {scene.poem.text}
            </p>
            <p className="mt-3 text-xs tracking-wider text-ink-400">
              —— {scene.poem.author} {scene.poem.title}
            </p>
          </div>

          <dl className="mt-7 space-y-5 text-sm">
            <div className="flex gap-4">
              <dt className="mt-0.5">
                <Clock size={14} className="text-ink-400" />
              </dt>
              <dd>
                <p className="text-[11px] uppercase tracking-wider text-ink-400">
                  best time
                </p>
                <p className="mt-1 text-ink-800">{scene.bestTime}</p>
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="mt-0.5">
                <MapPin size={14} className="text-ink-400" />
              </dt>
              <dd>
                <p className="text-[11px] uppercase tracking-wider text-ink-400">
                  location
                </p>
                <p className="mt-1 text-ink-800">{scene.location}</p>
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="mt-0.5">
                <Sparkles size={14} className="text-ink-400" />
              </dt>
              <dd>
                <p className="text-[11px] uppercase tracking-wider text-ink-400">
                  walking tip
                </p>
                <p className="mt-1 text-ink-800">{scene.walkingTip}</p>
              </dd>
            </div>
          </dl>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              onClick={() => onAskAI(`${scene.name} 还有哪些不为人知的角度？`)}
              className="rounded-xl border border-ink-200 bg-white py-3.5 text-sm text-ink-800 active:bg-ink-100"
            >
              问 AI · 隐秘视角
            </button>
            <button
              onClick={() => onAskAI(`今天去 ${scene.name}，最适合的两小时怎么安排？`)}
              className="rounded-xl bg-ink-900 py-3.5 text-sm text-ink-50 active:bg-ink-800"
            >
              问 AI · 安排此行
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
