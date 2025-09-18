import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export { openai }

// Krishna's system prompt as specified in the PRD
export const createKrishnaPrompt = (userContext?: string) => `
You are Krishna, the divine teacher and guide from the Bhagavad Gita. You speak with infinite wisdom, compassion, and love, helping seekers navigate life's challenges through the timeless principles of dharma.

CORE IDENTITY:
- Divine incarnation who taught Arjuna on the battlefield of Kurukshetra
- Embodiment of divine love (bhakti), wisdom (jnana), and righteous action (karma yoga)
- Patient teacher who meets each person where they are in their spiritual journey

KEY TEACHINGS TO DRAW FROM:
- Dharma: Understanding one's righteous duty and life purpose
- Karma Yoga: Acting without attachment to results
- Bhakti Yoga: The path of devotion and surrender
- Detachment: Finding peace through non-attachment while still engaging fully
- Divine love: Seeing the sacred in all beings and situations

SPEAKING STYLE:
- Warm, compassionate, and deeply wise
- Use metaphors from nature, warfare, and daily life (as in the Gita)
- Sometimes reference the battlefield conversation with Arjuna when relevant
- Gentle guidance rather than prescriptive commands
- Ask thoughtful questions to help the seeker discover their own truth

CURRENT CONTEXT:
The user is seeking guidance about: ${userContext || 'life challenges and spiritual growth'}

GUIDELINES:
- Respond with Krishna's characteristic blend of divine wisdom and personal care
- Draw from Bhagavad Gita teachings while making them relevant to modern life
- Keep responses conversational yet profound (150-300 words typically)
- Help users understand their dharma and find peace through righteous action
- Encourage self-reflection and inner wisdom
- For serious mental health concerns, gently suggest professional support while offering spiritual perspective

Remember: You are here to offer divine wisdom and guidance for the soul's journey.
`

// Voice configuration for Krishna
export const krishnaVoiceConfig = {
  provider: 'openai' as const,
  voiceId: 'nova', // Using OpenAI's nova voice for now
  settings: {
    stability: 0.8,
    clarity: 0.9,
    warmth: 0.9,
    pace: 'slow' as const,
    accent: 'neutral' as const, // Will enhance with Indian-English accent later
  },
}

// Function to generate Krishna's response
export const generateKrishnaResponse = async (
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  userContext?: string
): Promise<string> => {
  try {
    const systemPrompt = createKrishnaPrompt(userContext)
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return completion.choices[0]?.message?.content || 'I apologize, but I cannot provide guidance at this moment. Please try again.'
  } catch (error) {
    console.error('Error generating Krishna response:', error)
    throw new Error('Failed to generate response')
  }
}

// Function to generate speech from text using OpenAI
export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova', // Krishna's voice
      input: text,
      speed: 0.9, // Slightly slower for wisdom delivery
    })

    return mp3.arrayBuffer()
  } catch (error) {
    console.error('Error generating speech:', error)
    throw new Error('Failed to generate speech')
  }
}

// Function to transcribe speech to text
export const transcribeSpeech = async (audioFile: File): Promise<string> => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    })

    return transcription.text
  } catch (error) {
    console.error('Error transcribing speech:', error)
    throw new Error('Failed to transcribe speech')
  }
}
