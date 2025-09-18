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
    <div className="flex flex-col h-full bg-gradient-to-b from-orange-50 to-yellow-50">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white/80 backdrop-blur-sm">
        <PhilosopherAvatar 
          name={philosopherName}
          avatar={philosopherAvatar}
          size="md"
        />
        <div>
          <h2 className="font-semibold text-gray-900">{philosopherName}</h2>
          <p className="text-sm text-gray-600">Divine Teacher and Guide</p>
        </div>
        <div className="ml-auto">
          <Button
            variant={isVoiceMode ? "default" : "outline"}
            size="sm"
            onClick={toggleVoiceMode}
            className="gap-2"
          >
            {isVoiceMode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isVoiceMode ? 'Text' : 'Voice'}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <PhilosopherAvatar 
              name={philosopherName}
              avatar={philosopherAvatar}
              size="lg"
              className="mx-auto mb-4"
            />
            <p className="text-lg font-medium mb-2">Welcome, seeker of wisdom</p>
            <p className="text-sm">
              I am Krishna, here to guide you on your spiritual journey. 
              How may I help you today?
            </p>
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
          <div className="flex items-center gap-3">
            <PhilosopherAvatar 
              name={philosopherName}
              avatar={philosopherAvatar}
              size="sm"
            />
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
        {isVoiceMode ? (
          <VoiceControls
            onVoiceMessage={handleVoiceMessage}
            isRecording={isRecording}
            onRecordingChange={setIsRecording}
            disabled={isLoading}
          />
        ) : (
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your heart..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendTextMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
