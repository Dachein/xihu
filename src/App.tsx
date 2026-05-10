import { useState } from 'react'
import { Header } from './components/Header'
import { NowCard } from './components/NowCard'
import { SceneList } from './components/SceneList'
import { StorySection } from './components/StorySection'
import { RouteSection } from './components/RouteSection'
import { SceneSheet } from './components/SceneSheet'
import { AICopilot, AICopilotFAB } from './components/AICopilot'
import { scenes } from './data/scenes'

export default function App() {
  const [openSceneId, setOpenSceneId] = useState<string | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiSeed, setAiSeed] = useState<string | null>(null)

  const openScene = (id: string) => setOpenSceneId(id)
  const askAI = (seed: string) => {
    setAiSeed(seed)
    setAiOpen(true)
  }

  const openScene2 = openSceneId ? scenes.find((s) => s.id === openSceneId) ?? null : null

  return (
    <div className="mx-auto min-h-full max-w-[480px] bg-ink-50">
      <Header />
      <main className="pb-32 pt-2">
        <NowCard onOpenScene={openScene} />
        <SceneList onOpenScene={openScene} />
        <StorySection onAskAI={askAI} />
        <RouteSection onAskAI={askAI} />
        <Footer />
      </main>

      <AICopilotFAB
        onClick={() => {
          setAiSeed(null)
          setAiOpen(true)
        }}
      />

      <SceneSheet
        scene={openScene2}
        onClose={() => setOpenSceneId(null)}
        onAskAI={(seed) => {
          setOpenSceneId(null)
          askAI(seed)
        }}
      />

      <AICopilot
        open={aiOpen}
        seed={aiSeed}
        onOpenChange={(v) => {
          setAiOpen(v)
          if (!v) setAiSeed(null)
        }}
      />
    </div>
  )
}

function Footer() {
  return (
    <footer className="mt-16 px-5 py-10 text-center">
      <p className="font-serif text-sm text-ink-400">
        欲把西湖比西子，淡妆浓抹总相宜。
      </p>
      <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-ink-300">
        xihu · v0
      </p>
    </footer>
  )
}
