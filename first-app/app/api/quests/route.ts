import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('quests')
    .select('*')

  return NextResponse.json({ data, error })
}

export async function POST(req: Request) {
  const body = await req.json()

  const { data, error } = await supabase
    .from('quests')
    .insert([
      {
        title: body.title,
        xp: body.xp ?? 100
      }
    ])

  return NextResponse.json({ data, error })
}