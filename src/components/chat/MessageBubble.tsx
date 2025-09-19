'use client'

import { Message } from '@/lib/supabase'
import { PhilosopherAvatar } from './PhilosopherAvatar'
import { AudioPlayer } from './AudioPlayer'
import { Button } from '@/components/ui/button'
import { BookmarkPlus, Volume2 } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { useState } from 'react'

interface MessageBubbleProps {
  message: Message
  philosopherName: string
  philosopherAvatar?: string
  onSaveInsight?: (content: string) => void
  onPlayAudio?: (text: string) => Promise<void>
}

export function MessageBubble({
  message,
  philosopherName,
  philosopherAvatar,
  onSaveInsight,
  onPlayAudio
}: MessageBubbleProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const isUser = message.role === 'user'
  const isVoiceMessage = message.message_type === 'voice'

  const handleSaveInsight = () => {
    if (onSaveInsight && !isUser) {
      onSaveInsight(message.content)
    }
  }

  const handlePlayAudio = async () => {
    if (onPlayAudio && !isUser) {
      setIsPlayingAudio(true)
      try {
        await onPlayAudio(message.content)
      } catch (error) {
        console.error('Error playing audio:', error)
      } finally {
        setIsPlayingAudio(false)
      }
    }
  }

  return (
    <div className={cn(
      "flex gap-4 max-w-5xl animate-slide-up",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {/* Avatar - only show for assistant messages */}
      {!isUser && (
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-sage-400/20 to-sage-500/20 rounded-full blur-md" />
          <PhilosopherAvatar 
            name={philosopherName}
            avatar={philosopherAvatar}
            size="sm"
            className="relative z-10 shadow-medium"
          />
        </div>
      )}

      <div className={cn(
        "flex flex-col gap-1",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message bubble */}
        <div className={cn(
          "rounded-2xl px-6 py-4 max-w-lg shadow-medium transition-all duration-200 hover:shadow-large",
          isUser 
            ? "bg-gradient-to-r from-sage-500 to-sage-600 text-white rounded-br-md" 
            : "bg-white text-wisdom-900 rounded-bl-md border border-sage-100/50"
        )}>
          {/* Voice message indicator */}
          {isVoiceMessage && message.audio_url && (
            <div className="mb-2">
              <AudioPlayer 
                audioUrl={message.audio_url}
                duration={message.audio_duration}
              />
            </div>
          )}

          {/* Message content */}
          <p className="text-base leading-relaxed whitespace-pre-wrap font-medium">
            {message.content}
          </p>

          {/* Action buttons for assistant messages */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-sage-100/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayAudio}
                disabled={isPlayingAudio}
                className="h-8 px-3 text-xs text-wisdom-500 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-all duration-200 group"
              >
                <Volume2 className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" />
                {isPlayingAudio ? 'Playing...' : 'Listen'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveInsight}
                className="h-8 px-3 text-xs text-wisdom-500 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-all duration-200 group"
              >
                <BookmarkPlus className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" />
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className={cn(
          "text-xs text-wisdom-400 px-2 font-medium",
          isUser ? "text-right" : "text-left"
        )}>
          {formatDate(message.created_at)}
        </span>
      </div>
    </div>
  )
}
