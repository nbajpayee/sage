import { NextRequest, NextResponse } from 'next/server'
import { transcribeSpeech } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please provide an audio file.' },
        { status: 400 }
      )
    }

    // Validate file size (max 25MB for OpenAI Whisper)
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    // Transcribe the audio
    const transcript = await transcribeSpeech(audioFile)

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: 'No speech detected in audio file' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      transcript: transcript.trim(),
      duration: 0, // We could calculate this if needed
    })

  } catch (error) {
    console.error('Transcription error:', error)
    
    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      
      if (error.message.includes('invalid file')) {
        return NextResponse.json(
          { error: 'Invalid audio file format' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
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
