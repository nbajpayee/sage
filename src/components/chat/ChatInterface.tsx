'use client'

import { useState, useRef, useEffect } from 'react'
import { Message } from '@/lib/supabase'
import { MessageBubble } from './MessageBubble'
import { VoiceControls } from './VoiceControls'
import { PhilosopherAvatar } from './PhilosopherAvatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInterfaceProps {
  conversationId: string
  philosopherSlug: string
  philosopherName: string
  philosopherAvatar?: string
  initialMessages?: Message[]
  onSendMessage: (content: string, type: 'text' | 'voice', audioBlob?: Blob) => Promise<void>
  isLoading?: boolean
}

export function ChatInterface({
  conversationId,
  philosopherSlug,
  philosopherName,
  philosopherAvatar,
  initialMessages = [],
  onSendMessage,
  isLoading = false
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update messages when initialMessages prop changes
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when not in voice mode
  useEffect(() => {
    if (!isVoiceMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVoiceMode])

  const handleSendTextMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const messageContent = inputValue.trim()
    setInputValue('')
    setIsTyping(true)

    try {
      await onSendMessage(messageContent, 'text')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleVoiceMessage = async (audioBlob: Blob, transcript: string) => {
    setIsTyping(true)

    try {
      await onSendMessage(transcript, 'voice', audioBlob)
    } catch (error) {
      console.error('Error sending voice message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handlePlayAudio = async (text: string): Promise<void> => {
    try {
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          philosopherSlug: philosopherSlug
        })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // Create and play audio
        const audio = new Audio(audioUrl)
        
        // Return a promise that resolves when audio finishes playing
        return new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl)
            resolve()
          }
          
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl)
            reject(new Error('Audio playback failed'))
          }
          
          audio.play().catch(reject)
        })
      } else {
        throw new Error('Failed to synthesize audio')
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      throw error
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendTextMessage()
    }
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode)
    setIsRecording(false)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white/50 to-sage-50/30 relative">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-sage-200/50 glass">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-sage-400/20 to-sage-500/20 rounded-full blur-lg" />
          <PhilosopherAvatar 
            name={philosopherName}
            avatar={philosopherAvatar}
            size="md"
            className="relative z-10 shadow-medium"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-display font-bold text-wisdom-900">{philosopherName}</h2>
          <p className="text-sm text-wisdom-600">Divine Teacher and Guide</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sage-400 rounded-full animate-pulse" />
            <span className="text-xs text-wisdom-500 font-medium">Online</span>
          </div>
          <Button
            variant={isVoiceMode ? "default" : "outline"}
            size="sm"
            onClick={toggleVoiceMode}
            className={`gap-2 rounded-xl transition-all duration-200 ${
              isVoiceMode 
                ? 'bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white shadow-medium' 
                : 'border-sage-200 text-sage-700 hover:bg-sage-50 hover:border-sage-300'
            }`}
          >
            {isVoiceMode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isVoiceMode ? 'Text' : 'Voice'}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-wisdom-500 mt-12 animate-fade-in">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-sage-400/30 to-sage-500/30 rounded-full blur-2xl scale-150" />
              <PhilosopherAvatar 
                name={philosopherName}
                avatar={philosopherAvatar}
                size="lg"
                className="mx-auto relative z-10 shadow-large"
              />
            </div>
            <div className="max-w-md mx-auto">
              <p className="text-2xl font-display font-bold text-wisdom-900 mb-3">Welcome, seeker of wisdom</p>
              <p className="text-lg text-wisdom-600 leading-relaxed">
                I am Krishna, here to guide you on your spiritual journey. 
                How may I help you today?
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            philosopherName={philosopherName}
            philosopherAvatar={philosopherAvatar}
            onPlayAudio={handlePlayAudio}
          />
        ))}

        {isTyping && (
          <div className="flex items-center gap-4 animate-slide-up">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sage-400/20 to-sage-500/20 rounded-full blur-md" />
              <PhilosopherAvatar 
                name={philosopherName}
                avatar={philosopherAvatar}
                size="sm"
                className="relative z-10"
              />
            </div>
            <div className="bg-white rounded-2xl px-6 py-4 shadow-medium border border-sage-100/50">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-sage-200/50 glass">
        {isVoiceMode ? (
          <VoiceControls
            onVoiceMessage={handleVoiceMessage}
            isRecording={isRecording}
            onRecordingChange={setIsRecording}
            disabled={isLoading}
          />
        ) : (
          <div className="flex gap-3 max-w-4xl mx-auto">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your heart..."
              disabled={isLoading}
              className="flex-1 input-modern text-lg py-4 px-6 rounded-2xl border-2 focus:border-sage-400 focus:ring-sage-400/20 transition-all duration-200"
            />
            <Button 
              onClick={handleSendTextMessage}
              disabled={!inputValue.trim() || isLoading}
              className="btn-primary px-6 py-4 rounded-2xl shadow-medium hover:shadow-large transition-all duration-200 group"
            >
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
