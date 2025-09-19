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
    <div className="min-h-screen bg-gradient-to-br from-white via-sage-50/30 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sage-100/40 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sage-200/20 to-transparent rounded-full blur-3xl animate-sacred-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-sage-100/30 to-transparent rounded-full blur-3xl animate-breathe" />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center animate-fade-in">
            {/* Logo/Brand */}
            <div className="mb-16">
              <h1 className="text-5xl sm:text-7xl font-display font-bold text-wisdom-900 mb-6 tracking-tight">
                Welcome to
              </h1>
              <div className="inline-flex items-center gap-6 mb-6 animate-sacred-float">
                <div className="w-16 h-16 bg-gradient-to-br from-sage-500 to-sage-600 rounded-2xl flex items-center justify-center shadow-large">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <span className="text-7xl font-display font-bold gradient-text leading-[1.2]">Sage</span>
              </div>
              <p className="text-xl sm:text-2xl text-wisdom-600 font-light max-w-3xl mx-auto leading-relaxed">
                Solve your life's toughest problems with the wisdom of history's greatest thinkers
              </p>
            </div>

            {/* Krishna Introduction */}
            {krishnaData && (
              <div className="mb-16 animate-slide-up">
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-sage-400 to-sage-500 rounded-full blur-xl opacity-30 scale-110" />
                    <PhilosopherAvatar 
                      name={krishnaData.philosopher.name}
                      avatar={krishnaData.philosopher.avatar_url}
                      size="lg"
                      className="w-28 h-28 shadow-lg ring-4 ring-white/80 relative z-10"
                    />
                  </div>
                </div>
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl font-display font-bold text-wisdom-900 mb-4">
                    Begin Your Journey with <span className="gradient-text">{krishnaData.philosopher.name}</span>
                  </h2>
                  <p className="text-lg text-wisdom-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                    {krishnaData.philosopher.description}
                  </p>
                  
                  {/* Specialties */}
                  <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {krishnaData.philosopher.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-sage-50 to-sage-100 text-sage-700 rounded-full text-sm font-medium border border-sage-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="mb-20 animate-scale-in">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button
                  onClick={startConversation}
                  disabled={isLoading}
                  size="lg"
                  className="btn-primary px-8 py-4 text-lg font-semibold rounded-2xl group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  )}
                  Start Your Spiritual Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-sage-200 text-sage-700 hover:bg-sage-50 hover:border-sage-300 transition-all duration-200"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Try Voice Chat
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-wisdom-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sage-400 rounded-full animate-gentle-pulse" />
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sage-400 rounded-full animate-gentle-pulse" style={{ animationDelay: '1s' }} />
                  <span>Anonymous</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sage-400 rounded-full animate-gentle-pulse" style={{ animationDelay: '2s' }} />
                  <span>No Signup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-sage-50/20 to-white" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100/50 text-sage-700 rounded-full text-sm font-medium mb-6 border border-sage-200/50">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Advanced AI</span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-display font-bold text-wisdom-900 mb-6">
              Experience Wisdom Like <span className="gradient-text">Never Before</span>
            </h3>
            <p className="text-xl text-wisdom-600 max-w-3xl mx-auto leading-relaxed">
              Engage in meaningful conversations that blend ancient wisdom with modern understanding through cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Text & Voice Chat */}
            <div className="group text-center p-8 card-modern hover:scale-105 transition-all duration-300">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-sage-100 to-sage-200 rounded-2xl flex items-center justify-center mx-auto shadow-medium group-hover:shadow-large transition-all duration-300">
                  <Mic className="w-8 h-8 text-sage-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-sage-400 to-sage-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <h4 className="text-2xl font-display font-bold text-wisdom-900 mb-4">
                Multi-Modal Conversations
              </h4>
              <p className="text-wisdom-600 leading-relaxed">
                Chat through text or speak naturally with voice recognition and Krishna's authentic voice responses powered by advanced AI
              </p>
            </div>

            {/* Personalized Guidance */}
            <div className="group text-center p-8 card-modern hover:scale-105 transition-all duration-300">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-sage-100 to-sage-200 rounded-2xl flex items-center justify-center mx-auto shadow-medium group-hover:shadow-large transition-all duration-300">
                  <Heart className="w-8 h-8 text-sage-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-sage-400 to-sage-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <h4 className="text-2xl font-display font-bold text-wisdom-900 mb-4">
                Personalized Guidance
              </h4>
              <p className="text-wisdom-600 leading-relaxed">
                Receive wisdom tailored to your unique challenges, drawing from the timeless teachings of the Bhagavad Gita and Krishna's divine insights
              </p>
            </div>

            {/* Save Insights */}
            <div className="group text-center p-8 card-modern hover:scale-105 transition-all duration-300">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-sage-100 to-sage-200 rounded-2xl flex items-center justify-center mx-auto shadow-medium group-hover:shadow-large transition-all duration-300">
                  <Sparkles className="w-8 h-8 text-sage-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-sage-400 to-sage-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <h4 className="text-2xl font-display font-bold text-wisdom-900 mb-4">
                Meaningful Insights
              </h4>
              <p className="text-wisdom-600 leading-relaxed">
                Save and reflect on profound moments from your conversations for continued spiritual growth and personal transformation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Conversation Starters */}
      {krishnaData && (
        <div className="py-20 bg-gradient-to-b from-white to-sage-50/30">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100/50 text-sage-700 rounded-full text-sm font-medium mb-6 border border-sage-200/50">
                <MessageCircle className="w-4 h-4" />
                <span>Start Your Journey</span>
              </div>
              <h3 className="text-4xl sm:text-5xl font-display font-bold text-wisdom-900 mb-6">
                What Would You Like to <span className="gradient-text">Explore?</span>
              </h3>
              <p className="text-xl text-wisdom-600 max-w-2xl mx-auto leading-relaxed">
                Here are some ways Krishna can guide you on your spiritual journey
              </p>
            </div>

            <div className="grid gap-6 max-w-3xl mx-auto">
              {krishnaData.conversationStarters.slice(0, 4).map((starter, index) => (
                <div
                  key={index}
                  className="group p-6 card-modern cursor-pointer hover:scale-[1.02] transition-all duration-300 border-l-4 border-sage-200 hover:border-sage-400"
                  onClick={startConversation}
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

            <div className="text-center mt-12">
              <Button
                onClick={startConversation}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-sage-200 text-sage-700 hover:bg-sage-50 hover:border-sage-300 transition-all duration-200 group"
              >
                Explore All Topics
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-t from-wisdom-900 to-wisdom-800 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sage-900/20 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-4 text-center relative">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-500 rounded-xl flex items-center justify-center shadow-large">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-white">Sage</span>
            </div>
            <h4 className="text-3xl font-display font-bold text-white mb-3">Wisdom Guide</h4>
            <p className="text-xl text-wisdom-300 max-w-2xl mx-auto leading-relaxed">
              Connecting seekers with timeless wisdom for modern life through AI-powered spiritual conversations
            </p>
          </div>
          
          <div className="border-t border-wisdom-700 pt-8">
            <div className="text-wisdom-400 space-y-3">
              <p className="text-lg">
                Built with respect for spiritual traditions and the seekers who follow them
              </p>
              <p className="text-sm">
                This is an AI-powered experience. For serious mental health concerns, please consult a professional.
              </p>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-sage-400" />
                  <span>Made with love for spiritual seekers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
