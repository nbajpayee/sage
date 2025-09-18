import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format time duration for audio
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Generate a unique conversation title based on first message
export function generateConversationTitle(firstMessage: string): string {
  const words = firstMessage.split(' ').slice(0, 6)
  return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '')
}

// Check if browser supports speech recognition
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && 
         ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
}

// Check if browser supports speech synthesis
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// Convert ArrayBuffer to Blob for audio playback
export function arrayBufferToBlob(buffer: ArrayBuffer, mimeType: string = 'audio/mpeg'): Blob {
  return new Blob([buffer], { type: mimeType })
}

// Create object URL for audio playback
export function createAudioUrl(audioBuffer: ArrayBuffer): string {
  const blob = arrayBufferToBlob(audioBuffer)
  return URL.createObjectURL(blob)
}

// Clean up object URL to prevent memory leaks
export function revokeAudioUrl(url: string): void {
  URL.revokeObjectURL(url)
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Extract key themes from conversation for insights
export function extractThemes(messages: Array<{ content: string; role: string }>): string[] {
  const themes = new Set<string>()
  const keyWords = [
    'dharma', 'purpose', 'duty', 'karma', 'action', 'detachment',
    'devotion', 'love', 'peace', 'wisdom', 'guidance', 'suffering',
    'grief', 'loss', 'relationship', 'family', 'career', 'decision'
  ]

  messages.forEach(message => {
    const content = message.content.toLowerCase()
    keyWords.forEach(word => {
      if (content.includes(word)) {
        themes.add(word)
      }
    })
  })

  return Array.from(themes)
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Debounce function for search and input handling
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Generate random conversation starter
export function getRandomConversationStarter(starters: string[]): string {
  return starters[Math.floor(Math.random() * starters.length)]
}

// Check if message contains potential mental health concerns
export function containsMentalHealthConcerns(message: string): boolean {
  const concernKeywords = [
    'suicide', 'kill myself', 'end it all', 'not worth living',
    'severe depression', 'panic attack', 'self harm', 'hurt myself'
  ]
  
  const lowerMessage = message.toLowerCase()
  return concernKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Generate mental health disclaimer
export function getMentalHealthDisclaimer(): string {
  return "I sense you may be going through a particularly difficult time. While I'm here to offer spiritual guidance, please remember that professional mental health support can be invaluable. Consider reaching out to a counselor, therapist, or crisis helpline if you need immediate support."
}
