'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Message } from '@/lib/supabase'
import { generateConversationTitle } from '@/lib/utils'

interface KrishnaData {
  philosopher: {
    id: string
    name: string
    slug: string
    title: string
    tradition: string
    description: string
    specialties: string[]
    avatar_url?: string
  }
  conversationStarters: string[]
  randomStarter: string
}

export default function KrishnaChat() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('conversation')

  const [krishnaData, setKrishnaData] = useState<KrishnaData | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load Krishna data on mount
  useEffect(() => {
    loadKrishnaData()
  }, [])

  // Create conversation if none exists
  useEffect(() => {
    if (krishnaData && !currentConversationId) {
      createNewConversation()
    }
  }, [krishnaData])

  const loadKrishnaData = async () => {
    try {
      const response = await fetch('/api/krishna')
      if (!response.ok) throw new Error('Failed to load Krishna data')
      
      const data = await response.json()
      setKrishnaData(data)
    } catch (err) {
      console.error('Error loading Krishna data:', err)
      setError('Failed to load Krishna. Please refresh the page.')
    }
  }

  const createNewConversation = async () => {
    if (!krishnaData) return

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          philosopherSlug: 'krishna',
          // userId: null for anonymous conversations
        })
      })

      if (!response.ok) throw new Error('Failed to create conversation')

      const { conversationId } = await response.json()
      setCurrentConversationId(conversationId)
      
      // Update URL with conversation ID
      const newUrl = `/chat/krishna?conversation=${conversationId}`
      window.history.replaceState({}, '', newUrl)
    } catch (err) {
      console.error('Error creating conversation:', err)
      setError('Failed to start conversation. Please try again.')
    }
  }

  const handleSendMessage = async (content: string, type: 'text' | 'voice') => {
    if (!currentConversationId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message: content,
          philosopherSlug: 'krishna'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const { response: krishnaResponse } = await response.json()

      // Add Krishna's response to messages
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        conversation_id: currentConversationId,
        role: 'assistant',
        content: krishnaResponse,
        message_type: 'text',
        created_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Generate audio for Krishna's response if in voice mode
      if (type === 'voice') {
        try {
          const audioResponse = await fetch('/api/voice/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: krishnaResponse,
              philosopherSlug: 'krishna'
            })
          })

          if (audioResponse.ok) {
            const audioBlob = await audioResponse.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            
            // Update message with audio
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, audio_url: audioUrl }
                : msg
            ))
          }
        } catch (audioErr) {
          console.error('Error generating audio:', audioErr)
          // Continue without audio - not a critical error
        }
      }

    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStarterClick = (starter: string) => {
    if (currentConversationId) {
      handleSendMessage(starter, 'text')
    }
  }

  const goBack = () => {
    router.push('/')
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!krishnaData || !currentConversationId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting with Krishna...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              Chat with {krishnaData.philosopher.name}
            </h1>
            <p className="text-sm text-gray-600">{krishnaData.philosopher.title}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)]">
        {messages.length === 0 && (
          <div className="p-6">
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Conversation Starters
              </div>
              <p className="text-gray-600 mb-4">
                Choose a topic to begin your conversation with Krishna
              </p>
            </div>
            
            <div className="grid gap-3 max-w-2xl mx-auto">
              {krishnaData.conversationStarters.map((starter, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="p-4 h-auto text-left justify-start hover:bg-orange-50 hover:border-orange-200"
                  onClick={() => handleStarterClick(starter)}
                >
                  <span className="text-sm leading-relaxed">{starter}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <ChatInterface
          conversationId={currentConversationId}
          philosopherSlug="krishna"
          philosopherName={krishnaData.philosopher.name}
          philosopherAvatar={krishnaData.philosopher.avatar_url}
          initialMessages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
