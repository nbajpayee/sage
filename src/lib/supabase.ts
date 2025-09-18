import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create Supabase client if environment variables are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Types for our database tables
export interface User {
  id: string
  email?: string
  created_at: string
  onboarding_completed: boolean
  preferred_philosophers: string[]
}

export interface Philosopher {
  id: string
  name: string
  slug: string
  title: string
  tradition: string
  description: string
  specialties: string[]
  avatar_url?: string
  voice_config?: VoiceConfig
  background_prompt: string
  conversation_starters: string[]
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Conversation {
  id: string
  user_id?: string
  philosopher_id: string
  title?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  message_type: 'text' | 'voice'
  audio_url?: string
  audio_duration?: number
  voice_config?: VoiceConfig
  created_at: string
}

export interface Insight {
  id: string
  user_id?: string
  conversation_id: string
  content: string
  tags: string[]
  created_at: string
}

export interface VoiceConfig {
  provider: 'openai' | 'elevenlabs' | 'native'
  voiceId: string
  settings: {
    stability: number
    clarity: number
    warmth: number
    pace: 'slow' | 'normal' | 'fast'
    accent: 'neutral' | 'indian-english'
  }
}

// Helper functions for database operations
export const getPhilosopher = async (slug: string): Promise<Philosopher | null> => {
  if (!supabase) {
    throw new Error('Database not available')
  }

  const { data, error } = await supabase
    .from('philosophers')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching philosopher:', error)
    return null
  }

  return data
}

export const createConversation = async (
  philosopherId: string,
  userId?: string
): Promise<string | null> => {
  if (!supabase) {
    throw new Error('Database not available')
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      philosopher_id: philosopherId,
      user_id: userId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    return null
  }

  return data.id
}

export const addMessage = async (
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  messageType: 'text' | 'voice' = 'text',
  audioUrl?: string,
  audioDuration?: number
): Promise<boolean> => {
  if (!supabase) {
    throw new Error('Database not available')
  }

  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      message_type: messageType,
      audio_url: audioUrl,
      audio_duration: audioDuration,
    })

  if (error) {
    console.error('Error adding message:', error)
    return false
  }

  return true
}

export const getConversationMessages = async (
  conversationId: string
): Promise<Message[]> => {
  if (!supabase) {
    throw new Error('Database not available')
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data
}

export const saveInsight = async (
  conversationId: string,
  content: string,
  tags: string[] = [],
  userId?: string
): Promise<boolean> => {
  if (!supabase) {
    throw new Error('Database not available')
  }

  const { error } = await supabase
    .from('insights')
    .insert({
      user_id: userId,
      conversation_id: conversationId,
      content,
      tags,
    })

  if (error) {
    console.error('Error saving insight:', error)
    return false
  }

  return true
}
