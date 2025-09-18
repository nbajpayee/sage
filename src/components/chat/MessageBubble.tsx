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
  onPlayAudio?: (text: string) => void
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

  const handlePlayAudio = () => {
    if (onPlayAudio && !isUser) {
      setIsPlayingAudio(true)
      onPlayAudio(message.content)
      // Reset after a delay (this would be handled by actual audio completion)
      setTimeout(() => setIsPlayingAudio(false), 3000)
    }
  }

  return (
    <div className={cn(
      "flex gap-3 max-w-4xl",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {/* Avatar - only show for assistant messages */}
      {!isUser && (
        <PhilosopherAvatar 
          name={philosopherName}
          avatar={philosopherAvatar}
          size="sm"
          className="flex-shrink-0"
        />
      )}

      <div className={cn(
        "flex flex-col gap-1",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-3 max-w-md shadow-sm",
          isUser 
            ? "bg-blue-600 text-white rounded-br-md" 
            : "bg-white text-gray-900 rounded-bl-md border"
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
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Action buttons for assistant messages */}
          {!isUser && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayAudio}
                disabled={isPlayingAudio}
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
              >
                <Volume2 className="w-3 h-3 mr-1" />
                {isPlayingAudio ? 'Playing...' : 'Listen'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveInsight}
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
              >
                <BookmarkPlus className="w-3 h-3 mr-1" />
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className={cn(
          "text-xs text-gray-500 px-2",
          isUser ? "text-right" : "text-left"
        )}>
          {formatDate(message.created_at)}
        </span>
      </div>
    </div>
  )
}
