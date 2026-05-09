"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Quest = {
  id: number
  title: string
  xp: number
}

export default function Home() {
  const [quests, setQuests] = useState<Quest[]>([])

  useEffect(() => {
    fetchQuests()
  }, [])

  async function fetchQuests() {
    const { data } = await supabase
      .from('quests')
      .select('*')

    setQuests(data || [])
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">

      {/* 1. Title */}
      <h1 className="text-5xl font-bold">
        SaaSathon is working 🚀
      </h1>

      {/* 2. Button */}
      <button
        onClick={fetchQuests}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh quests
      </button>

      {/* 3. Data output */}
      <div className="mt-6">
        {quests.length === 0 ? (
          <p>No quests yet</p>
        ) : (
          quests.map((q) => (
            <div key={q.id}>
              {q.title} — {q.xp} XP
            </div>
          ))
        )}
      </div>

    </main>
  )
}