import { NextRequest, NextResponse } from 'next/server'
import { createConversation, getPhilosopher } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

// Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const { philosopherSlug = 'krishna', userId } = await request.json()

    // Try to get philosopher data, use fallback if database not available
    let philosopher = null
    let conversationId = null

    try {
      philosopher = await getPhilosopher(philosopherSlug)
      if (philosopher) {
        conversationId = await createConversation(philosopher.id, userId)
      }
    } catch (dbError) {
      console.log('Database not available for conversation creation:', dbError)
    }

    // Use fallback data if database is not available
    if (!philosopher) {
      philosopher = {
        id: 'krishna-fallback',
        name: 'Krishna',
        slug: 'krishna',
        title: 'Divine Teacher and Guide',
        avatar_url: '/krishna/Krishna.png',
      }
    }

    // Generate a fallback conversation ID if database creation failed
    if (!conversationId) {
      conversationId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    return NextResponse.json({
      conversationId,
      philosopher: {
        id: philosopher.id,
        name: philosopher.name,
        slug: philosopher.slug,
        title: philosopher.title,
        avatar_url: philosopher.avatar_url,
      }
    })

  } catch (error) {
    console.error('Create conversation error:', error)
    
    // Return fallback even on error
    return NextResponse.json({
      conversationId: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      philosopher: {
        id: 'krishna-fallback',
        name: 'Krishna',
        slug: 'krishna',
        title: 'Divine Teacher and Guide',
        avatar_url: '/krishna/Krishna.png',
      }
    })
  }
}

// Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!supabase) {
      return NextResponse.json({
        conversations: [],
        hasMore: false
      })
    }

    let query = supabase
      .from('conversations')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        philosophers (
          name,
          slug,
          title,
          avatar_url
        ),
        messages (
          content,
          created_at
        )
      `)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by user if provided, otherwise get anonymous conversations
    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      query = query.is('user_id', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }

    // Transform the data to include last message and message count
    const conversations = data?.map(conv => ({
      id: conv.id,
      title: conv.title || 'New Conversation',
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      philosopher: conv.philosophers,
      lastMessage: conv.messages?.[0]?.content || null,
      messageCount: conv.messages?.length || 0
    })) || []

    return NextResponse.json({
      conversations,
      hasMore: conversations.length === limit
    })

  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
