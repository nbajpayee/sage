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
      <div className="text-center py-4 text-gray-500">
        <p className="text-sm">Voice recording is not supported in your browser.</p>
        <p className="text-xs mt-1">Please use a modern browser with microphone access.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Recording Button */}
      <Button
        onClick={toggleRecording}
        disabled={disabled}
        size="lg"
        className={cn(
          "w-16 h-16 rounded-full transition-all duration-200",
          isRecording 
            ? "bg-red-500 hover:bg-red-600 animate-pulse" 
            : "bg-blue-600 hover:bg-blue-700"
        )}
      >
        {isRecording ? (
          <Square className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </Button>

      {/* Status Text */}
      <div className="text-center">
        {isRecording ? (
          <p className="text-sm text-gray-600">
            {isTranscribing ? 'Listening...' : 'Recording...'}
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Tap to record your message
          </p>
        )}
      </div>

      {/* Live Transcript */}
      {transcript && (
        <div className="max-w-md p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}

      {/* Visual Indicator */}
      {isRecording && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
    </div>
  )
}
