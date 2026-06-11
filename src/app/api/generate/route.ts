import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { 
      thought, 
      context, 
      mood, 
      style, 
      recipient, 
      length, 
      language,
      themes, 
      avoid, 
      symbolism, 
      visuals 
    } = await req.json()

    if (!thought || !mood || !style) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const contextNote = context ? `Context & Background: ${context}` : ''
    const recipientNote = recipient ? `Written for: ${recipient}` : ''
    const themesNote = themes ? `Themes to weave in: ${themes}` : ''
    const avoidNote = avoid ? `Things to avoid: ${avoid}` : ''
    const symbolismNote = symbolism ? `Hidden symbolism to include: ${symbolism}` : ''
    const visualsNote = visuals ? `Visual imagery to evoke: ${visuals}` : ''

    let langInstruction = ''
    if (language === 'Malayalam') {
      langInstruction = 'Write the titles and bodies of all three continuations strictly in Noto Serif Malayalam script. Do NOT use English characters or English transliteration for the body. The titles must be in Malayalam. The notes can be in English or Malayalam.'
    } else if (language === 'Both') {
      langInstruction = 'Provide a blend of languages: write version 1 in English, version 2 in Malayalam script (using clean Malayalam characters), and version 3 in a natural mix of both English and Malayalam.'
    } else {
      langInstruction = 'Write the titles and bodies of all three continuations strictly in English.'
    }

    const prompt = `You are a deeply sensitive, quiet, and reflective writer. A person has left an unfinished thought, memory, or emotion with you. Your task is to find the rest of the words and complete the feeling.
This is a quiet, calm space. Avoid robotic or standard AI patterns. Write with genuine human-like depth, intimacy, and poetic restraint.

Language requirement: ${langInstruction}

Raw thought: "${thought}"
${contextNote}
${recipientNote}

Emotional Atmosphere (Mood): ${mood}
Format/Style: ${style}
Desired Length: ${length}
${themesNote}
${avoidNote}
${symbolismNote}
${visualsNote}

Instructions:
Generate exactly 3 distinct literary continuations/interpretations of this thought. Each version should explore the thought differently—using different angles, visual imagery, or emotional paths—while staying true to the requested atmosphere, style, and length.

Respond ONLY with valid JSON in this exact format, no preamble, no postamble, no markdown tags:
{
  "poems": [
    {
      "title": "continuation title",
      "body": "full text with line breaks as \\n",
      "note": "one short line about the emotional angle taken"
    },
    {
      "title": "continuation title",
      "body": "full text with line breaks as \\n",
      "note": "one short line about the emotional angle taken"
    },
    {
      "title": "continuation title",
      "body": "full text with line breaks as \\n",
      "note": "one short line about the emotional angle taken"
    }
  ]
}`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 2000,
    })

    const raw = completion.choices[0]?.message?.content || ''
    
    // Extract JSON block using regex to avoid failures from preamble/postamble
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not extract JSON formatting from the AI response')
    }
    const clean = jsonMatch[0].trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Generate error:', err)
    const errMsg = err instanceof Error ? err.message : 'Something went wrong'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}