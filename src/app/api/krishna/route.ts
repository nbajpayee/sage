import { NextRequest, NextResponse } from 'next/server'
import { getPhilosopher } from '@/lib/supabase'
import { getRandomConversationStarter } from '@/lib/utils'

// Fallback Krishna data for when database is not available
const fallbackKrishnaData = {
  id: 'krishna-fallback',
  name: 'Krishna',
  slug: 'krishna',
  title: 'Divine Teacher and Guide',
  tradition: 'Hinduism',
  description: 'The divine incarnation who shared the wisdom of the Bhagavad Gita with Arjuna on the battlefield of Kurukshetra. Krishna embodies divine love, wisdom, and guidance on dharma (righteous duty).',
  specialties: ['dharma', 'karma', 'devotion', 'duty', 'detachment', 'love', 'purpose'],
  avatar_url: null,
  conversation_starters: [
    "I feel lost in life and don't know my purpose. Can you help me understand my dharma?",
    "I'm struggling with a difficult decision. How do I know what's right?",
    "How can I find peace when everything around me feels chaotic?",
    "I'm dealing with loss and grief. How do I cope with attachment and letting go?",
    "What does it mean to act without attachment to results?",
    "How can I cultivate devotion in my daily life?",
    "I'm facing a moral dilemma at work. What would you advise?",
    "How do I balance my duties to family and my personal growth?"
  ],
  voice_config: null
}

export async function GET(request: NextRequest) {
  try {
    // Try to get Krishna's data from database
    let krishna = null
    
    try {
      krishna = await getPhilosopher('krishna')
    } catch (dbError) {
      console.log('Database not available, using fallback data:', dbError)
      krishna = fallbackKrishnaData
    }
    
    // Use fallback if database returns null
    if (!krishna) {
      console.log('No Krishna data in database, using fallback')
      krishna = fallbackKrishnaData
    }

    // Get a random conversation starter
    const randomStarter = getRandomConversationStarter(krishna.conversation_starters)

    return NextResponse.json({
      philosopher: {
        id: krishna.id,
        name: krishna.name,
        slug: krishna.slug,
        title: krishna.title,
        tradition: krishna.tradition,
        description: krishna.description,
        specialties: krishna.specialties,
        avatar_url: krishna.avatar_url,
      },
      conversationStarters: krishna.conversation_starters,
      randomStarter,
      voiceConfig: krishna.voice_config,
    })

  } catch (error) {
    console.error('Krishna API error:', error)
    
    // Return fallback data even if there's an error
    const randomStarter = getRandomConversationStarter(fallbackKrishnaData.conversation_starters)
    
    return NextResponse.json({
      philosopher: {
        id: fallbackKrishnaData.id,
        name: fallbackKrishnaData.name,
        slug: fallbackKrishnaData.slug,
        title: fallbackKrishnaData.title,
        tradition: fallbackKrishnaData.tradition,
        description: fallbackKrishnaData.description,
        specialties: fallbackKrishnaData.specialties,
        avatar_url: fallbackKrishnaData.avatar_url,
      },
      conversationStarters: fallbackKrishnaData.conversation_starters,
      randomStarter,
      voiceConfig: fallbackKrishnaData.voice_config,
    })
  }
}

// Get conversation starters for Krishna
export async function POST(request: NextRequest) {
  try {
    const { category } = await request.json()
    
    const krishna = await getPhilosopher('krishna')
    if (!krishna) {
      return NextResponse.json(
        { error: 'Krishna data not found' },
        { status: 404 }
      )
    }

    // Filter conversation starters by category if provided
    let starters = krishna.conversation_starters
    
    if (category) {
      // This is a simple implementation - in a real app you might want
      // to categorize starters in the database
      const categoryKeywords: Record<string, string[]> = {
        'purpose': ['purpose', 'dharma', 'duty', 'path'],
        'relationships': ['relationship', 'family', 'love', 'attachment'],
        'grief': ['grief', 'loss', 'death', 'letting go'],
        'decisions': ['decision', 'choice', 'right', 'wrong'],
        'peace': ['peace', 'chaos', 'calm', 'stress']
      }

      const keywords = categoryKeywords[category.toLowerCase()] || []
      if (keywords.length > 0) {
        starters = krishna.conversation_starters.filter(starter =>
          keywords.some(keyword => 
            starter.toLowerCase().includes(keyword)
          )
        )
      }
    }

    return NextResponse.json({
      starters,
      category: category || 'all'
    })

  } catch (error) {
    console.error('Krishna conversation starters error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation starters' },
      { status: 500 }
    )
  }
}
