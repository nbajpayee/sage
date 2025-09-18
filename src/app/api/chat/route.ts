import { NextRequest, NextResponse } from 'next/server'
import { generateKrishnaResponse } from '@/lib/openai'
import { getConversationMessages, addMessage, getPhilosopher } from '@/lib/supabase'
import { containsMentalHealthConcerns, getMentalHealthDisclaimer } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { conversationId, message, philosopherSlug = 'krishna' } = await request.json()

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Try to get philosopher data, use fallback if database not available
    let philosopher = null
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []

    try {
      philosopher = await getPhilosopher(philosopherSlug)
      
      // Try to add user message to database
      await addMessage(conversationId, 'user', message)
      
      // Try to get conversation history
      const messages = await getConversationMessages(conversationId)
      conversationHistory = messages
        .slice(0, -1) // Remove the last message (the one we just added)
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
    } catch (dbError) {
      console.log('Database not available, using in-memory conversation:', dbError)
      // For fallback mode, we'll just use the current message without history
      conversationHistory = []
    }

    // Use fallback philosopher data if needed
    if (!philosopher) {
      philosopher = {
        id: 'krishna-fallback',
        name: 'Krishna',
        slug: 'krishna',
        title: 'Divine Teacher and Guide',
      }
    }

    // Check for mental health concerns
    const hasMentalHealthConcerns = containsMentalHealthConcerns(message)
    
    // Generate Krishna's response
    let krishnaResponse = await generateKrishnaResponse(
      [...conversationHistory, { role: 'user', content: message }],
      'spiritual guidance and life wisdom'
    )

    // Add mental health disclaimer if needed
    if (hasMentalHealthConcerns) {
      krishnaResponse += '\n\n' + getMentalHealthDisclaimer()
    }

    // Try to add Krishna's response to database (fail silently if database not available)
    try {
      await addMessage(conversationId, 'assistant', krishnaResponse)
    } catch (dbError) {
      console.log('Could not save message to database:', dbError)
    }

    return NextResponse.json({
      response: krishnaResponse,
      philosopher: philosopher.name,
      hasDisclaimer: hasMentalHealthConcerns
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
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
