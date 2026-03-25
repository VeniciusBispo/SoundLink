import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const LYRICS_DATA = [
  {
    id: '1',
    text: "Eu amo ___, meu amor não se engane",
    gap: "você",
    options: ["vocês", "você", "eles", "nós"],
    song: "Amor I Love You",
    artist: "Marisa Monte"
  },
  {
    id: '2',
    text: "Chega de saudade, a realidade é que sem você não há ___",
    gap: "paz",
    options: ["nada", "paz", "vida", "luz"],
    song: "Chega de Saudade",
    artist: "Tom Jobim"
  },
  {
    id: '3',
    text: "So waking up is hard to do, and ___ up is even harder",
    gap: "staying",
    options: ["getting", "staying", "waking", "rising"],
    song: "Hard to Do",
    artist: "Rex Orange County"
  },
  {
    id: '4',
    text: "But if you like causing trouble in up in hotel ___",
    gap: "rooms",
    options: ["bars", "rooms", "lobbies", "halls"],
    song: "Perfect",
    artist: "One Direction"
  },
  {
    id: '5',
    text: "Garota de Ipanema, num doce balanço a caminho do ___",
    gap: "mar",
    options: ["mar", "sol", "rio", "bar"],
    song: "Garota de Ipanema",
    artist: "Vinícius de Moraes"
  },
  {
      id: '6',
      text: "And I will always love ___",
      gap: "you",
      options: ["you", "her", "him", "them"],
      song: "I Will Always Love You",
      artist: "Whitney Houston"
  },
  {
      id: '7',
      text: "Tente outra ___",
      gap: "vez",
      options: ["vez", "hora", "coisa", "vida"],
      song: "Tente Outra Vez",
      artist: "Raul Seixas"
  },
  {
      id: '8',
      text: "Imagine all the ___, living life in peace",
      gap: "people",
      options: ["world", "people", "friends", "children"],
      song: "Imagine",
      artist: "John Lennon"
  },
  {
      id: '9',
      text: "Deixa a vida me ___",
      gap: "levar",
      options: ["levar", "guiar", "mostrar", "amar"],
      song: "Deixa a Vida Me Levar",
      artist: "Zeca Pagodinho"
  },
  {
      id: '10',
      text: "Hello from the other ___",
      gap: "side",
      options: ["way", "side", "world", "place"],
      song: "Hello",
      artist: "Adele"
  }
]

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Shuffle and pick 10
    const questions = [...LYRICS_DATA]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10)

    return NextResponse.json(questions)
  } catch (error) {
    console.error('[API_LYRICS_GET]', error)
    return NextResponse.json({ error: 'Falha ao gerar o jogo' }, { status: 500 })
  }
}
