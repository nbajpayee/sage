'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2 } from 'lucide-react'
import { formatDuration, cn } from '@/lib/utils'

interface AudioPlayerProps {
  audioUrl: string
  duration?: number
  className?: string
}

export function AudioPlayer({ audioUrl, duration, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)
  const [isLoading, setIsLoading] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration)
      setIsLoading(false)
    })

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })

    audio.addEventListener('loadstart', () => {
      setIsLoading(true)
    })

    audio.addEventListener('canplay', () => {
      setIsLoading(false)
    })

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', () => {})
      audio.removeEventListener('timeupdate', () => {})
      audio.removeEventListener('ended', () => {})
      audio.removeEventListener('loadstart', () => {})
      audio.removeEventListener('canplay', () => {})
    }
  }, [audioUrl])

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      setIsLoading(true)
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Error playing audio:', error)
          setIsLoading(false)
        })
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const newTime = (clickX / width) * audioDuration

    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0

  return (
    <div className={cn("flex items-center gap-2 p-2 bg-gray-50 rounded-lg", className)}>
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayback}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      {/* Waveform/Progress Bar */}
      <div className="flex-1 flex items-center gap-2">
        <Volume2 className="w-3 h-3 text-gray-400" />
        <div 
          className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Duration */}
      <span className="text-xs text-gray-500 font-mono min-w-[40px]">
        {formatDuration(currentTime)} / {formatDuration(audioDuration)}
      </span>
    </div>
  )
}
