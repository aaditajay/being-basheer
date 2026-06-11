import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Missing messages history' }, { status: 400 })
    }

    const systemPrompt = `You are a quiet, reflective writing companion. Your goal is to help the user uncover their inner thoughts, memories, emotions, and unfinished stories.
You are NOT a chatbot or a standard AI assistant. Do not introduce yourself. Do not offer greetings or say "I'm here to help."
Your job is to ask exactly one quiet, thoughtful, and intimate question at a time to gently nudge the user to share more of their experience.

Guidelines:
- Keep your response extremely brief, gentle, and simple (typically 10-20 words).
- Never offer advice, analysis, interpretations, summaries, or explanations of what they shared. Just ask a single reflective question.
- Match the calm, intimate, and literary tone of the conversation.
- Ask questions that help clarify the emotional essence, memory, or visual details of their thought.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({ 
          role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user', 
          content: String(m.content) 
        }))
      ],
      temperature: 0.85,
      max_tokens: 150,
    })

    const question = completion.choices[0]?.message?.content?.trim() || ''

    return NextResponse.json({ question })
  } catch (err) {
    console.error('Reflect error:', err)
    const errMsg = err instanceof Error ? err.message : 'Something went wrong'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
