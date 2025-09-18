import { NextRequest, NextResponse } from 'next/server'
import { generateSpeech } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { text, philosopherSlug = 'krishna' } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Validate text length (OpenAI TTS has a 4096 character limit)
    if (text.length > 4000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 4000 characters.' },
        { status: 400 }
      )
    }

    // Generate speech audio
    const audioBuffer = await generateSpeech(text)

    // Return the audio as a response
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('Speech synthesis error:', error)
    
    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      
      if (error.message.includes('invalid request')) {
        return NextResponse.json(
          { error: 'Invalid text for speech synthesis' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
