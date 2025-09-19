'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceControlsProps {
  onVoiceMessage: (audioBlob: Blob, transcript: string) => void
  isRecording: boolean
  onRecordingChange: (recording: boolean) => void
  disabled?: boolean
}

export function VoiceControls({
  onVoiceMessage,
  isRecording,
  onRecordingChange,
  disabled = false
}: VoiceControlsProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Check for browser support
    const speechRecognitionSupported = 
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    const mediaRecorderSupported = 'MediaRecorder' in window
    
    setIsSupported(speechRecognitionSupported && mediaRecorderSupported)

    if (speechRecognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript(finalTranscript + interimTranscript)
        }

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsTranscribing(false)
        }

        recognitionRef.current.onend = () => {
          setIsTranscribing(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    if (!isSupported || disabled) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        if (transcript.trim()) {
          onVoiceMessage(audioBlob, transcript.trim())
        }
        
        // Clean up
        stream.getTracks().forEach(track => track.stop())
        setTranscript('')
      }

      mediaRecorderRef.current.start()
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsTranscribing(true)
      }

      onRecordingChange(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    if (recognitionRef.current && isTranscribing) {
      recognitionRef.current.stop()
    }

    onRecordingChange(false)
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  if (!isSupported) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-lg font-medium text-wisdom-700 mb-2">Voice recording not supported</p>
        <p className="text-sm text-wisdom-500">Please use a modern browser with microphone access.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 animate-fade-in">
      {/* Recording Button */}
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30" />
        )}
        <Button
          onClick={toggleRecording}
          disabled={disabled}
          size="lg"
          className={cn(
            "w-20 h-20 rounded-full transition-all duration-300 shadow-large hover:shadow-xl relative z-10 group",
            isRecording 
              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse" 
              : "bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 hover:scale-105"
          )}
        >
          {isRecording ? (
            <Square className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          ) : (
            <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          )}
        </Button>
      </div>

      {/* Status Text */}
      <div className="text-center">
        {isRecording ? (
          <div className="space-y-2">
            <p className="text-lg font-medium text-wisdom-700">
              {isTranscribing ? 'Listening...' : 'Recording...'}
            </p>
            <p className="text-sm text-wisdom-500">
              Speak clearly and naturally
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium text-wisdom-700">
              Ready to listen
            </p>
            <p className="text-sm text-wisdom-500">
              Tap the microphone to record your message
            </p>
          </div>
        )}
      </div>

      {/* Live Transcript */}
      {transcript && (
        <div className="max-w-lg p-4 bg-white rounded-2xl shadow-medium border border-sage-100/50 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-sage-100 to-sage-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mic className="w-4 h-4 text-sage-600" />
            </div>
            <div>
              <p className="text-xs text-wisdom-500 font-medium mb-1">Live Transcript</p>
              <p className="text-base text-wisdom-700 leading-relaxed">{transcript}</p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
    </div>
  )
}
