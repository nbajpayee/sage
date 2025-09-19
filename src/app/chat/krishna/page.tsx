'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, MessageCircle } from 'lucide-react'
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

  const handleSendMessage = async (content: string, type: 'text' | 'voice' = 'text', audioBlob?: Blob) => {
    if (!currentConversationId) return

    setIsLoading(true)
    setError(null)

    // Add user's message to state first
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      conversation_id: currentConversationId,
      role: 'user',
      content: content,
      message_type: type,
      audio_url: audioBlob ? URL.createObjectURL(audioBlob) : undefined,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])

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
      <div className="min-h-screen bg-gradient-to-br from-white via-sage-50/30 to-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sage-100/40 via-transparent to-transparent" />
        <div className="text-center p-8 card-modern max-w-md mx-4 relative animate-scale-in">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-wisdom-900 mb-3">Something went wrong</h2>
          <p className="text-wisdom-600 mb-6 leading-relaxed">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-3 rounded-xl"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!krishnaData || !currentConversationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-sage-50/30 to-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sage-100/40 via-transparent to-transparent" />
        <div className="text-center relative animate-fade-in">
          <div className="w-16 h-16 border-4 border-sage-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-wisdom-600 font-medium">Connecting with Krishna...</p>
          <p className="text-sm text-wisdom-500 mt-2">Preparing your spiritual journey</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sage-50/20 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sage-100/30 via-transparent to-transparent" />
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-sage-200/50 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goBack}
            className="hover:bg-sage-50 rounded-xl transition-all duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-wisdom-900">
              Chat with <span className="gradient-text">{krishnaData.philosopher.name}</span>
            </h1>
            <p className="text-sm text-wisdom-600">{krishnaData.philosopher.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sage-400 rounded-full animate-pulse" />
            <span className="text-xs text-wisdom-500 font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto h-[calc(100vh-88px)] relative">
        {messages.length === 0 && (
          <div className="p-8 animate-fade-in">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100/50 text-sage-700 rounded-full text-sm font-medium mb-6 border border-sage-200/50">
                <Sparkles className="w-4 h-4" />
                <span>Conversation Starters</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-wisdom-900 mb-4">
                Begin Your Journey with <span className="gradient-text">Krishna</span>
              </h2>
              <p className="text-lg text-wisdom-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                Choose a topic to begin your conversation with the divine teacher
              </p>
            </div>
            
            <div className="grid gap-4 max-w-3xl mx-auto">
              {krishnaData.conversationStarters.map((starter, index) => (
                <div
                  key={index}
                  className="group p-6 card-modern cursor-pointer hover:scale-[1.02] transition-all duration-300 border-l-4 border-sage-200 hover:border-sage-400"
                  onClick={() => handleStarterClick(starter)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-sage-100 to-sage-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5 text-sage-600" />
                    </div>
                    <p className="text-wisdom-700 leading-relaxed font-medium group-hover:text-wisdom-900 transition-colors">{starter}</p>
                  </div>
                </div>
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
