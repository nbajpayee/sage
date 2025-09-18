'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PhilosopherAvatar } from '@/components/chat/PhilosopherAvatar'
import { MessageCircle, Mic, Heart, Sparkles, ArrowRight } from 'lucide-react'

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

export default function Home() {
  const router = useRouter()
  const [krishnaData, setKrishnaData] = useState<KrishnaData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadKrishnaData()
  }, [])

  const loadKrishnaData = async () => {
    try {
      const response = await fetch('/api/krishna')
      if (response.ok) {
        const data = await response.json()
        setKrishnaData(data)
      }
    } catch (error) {
      console.error('Error loading Krishna data:', error)
    }
  }

  const startConversation = () => {
    setIsLoading(true)
    router.push('/chat/krishna')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 to-yellow-100/20" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4">
                Wisdom Guide
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 font-light">
                Connect with the wisdom of history's greatest teachers
              </p>
            </div>

            {/* Krishna Introduction */}
            {krishnaData && (
              <div className="mb-12">
                <div className="flex justify-center mb-6">
                  <PhilosopherAvatar 
                    name={krishnaData.philosopher.name}
                    avatar={krishnaData.philosopher.avatar_url}
                    size="lg"
                    className="w-24 h-24 shadow-lg ring-4 ring-white"
                  />
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
                  Meet {krishnaData.philosopher.name}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                  {krishnaData.philosopher.description}
                </p>
                
                {/* Specialties */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {krishnaData.philosopher.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="mb-16">
              <Button
                onClick={startConversation}
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <MessageCircle className="w-5 h-5 mr-2" />
                )}
                Start Your Journey with Krishna
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                Free • Anonymous • No signup required
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Experience Wisdom Like Never Before
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Engage in meaningful conversations that blend ancient wisdom with modern understanding
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Text & Voice Chat */}
            <div className="text-center p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Multi-Modal Conversations
              </h4>
              <p className="text-gray-600">
                Chat through text or speak naturally with voice recognition and Krishna's authentic voice responses
              </p>
            </div>

            {/* Personalized Guidance */}
            <div className="text-center p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Personalized Guidance
              </h4>
              <p className="text-gray-600">
                Receive wisdom tailored to your unique challenges, drawing from the timeless teachings of the Bhagavad Gita
              </p>
            </div>

            {/* Save Insights */}
            <div className="text-center p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Meaningful Insights
              </h4>
              <p className="text-gray-600">
                Save and reflect on profound moments from your conversations for continued spiritual growth
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Conversation Starters */}
      {krishnaData && (
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                What Would You Like to Explore?
              </h3>
              <p className="text-lg text-gray-600">
                Here are some ways Krishna can guide you on your journey
              </p>
            </div>

            <div className="grid gap-4 max-w-2xl mx-auto">
              {krishnaData.conversationStarters.slice(0, 4).map((starter, index) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 hover:border-orange-200"
                  onClick={startConversation}
                >
                  <p className="text-gray-700 leading-relaxed">{starter}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={startConversation}
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                Explore All Topics
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-6">
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Wisdom Guide</h4>
            <p className="text-gray-600">
              Connecting seekers with timeless wisdom for modern life
            </p>
          </div>
          
          <div className="text-sm text-gray-500">
            <p className="mb-2">
              Built with respect for spiritual traditions and the seekers who follow them
            </p>
            <p>
              This is an AI-powered experience. For serious mental health concerns, please consult a professional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
