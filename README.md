# Wisdom Guide - AI-Powered Spiritual Guidance Platform

Connect with the wisdom of history's greatest philosophers and spiritual teachers through AI-powered conversations. Starting with Krishna as our first guide, offering authentic teachings from the Bhagavad Gita.

## 🌟 Features

- **Multi-Modal Conversations**: Chat through text or voice with Krishna
- **Authentic Teachings**: Responses based on Bhagavad Gita wisdom and dharma principles
- **Voice Integration**: Speech-to-text input and text-to-speech responses
- **Anonymous Conversations**: No signup required for basic usage
- **Expandable Architecture**: Built to easily add more philosophers
- **Modern UI**: Beautiful, responsive design with spiritual aesthetics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
```bash
cd wisdom-guide
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Set up Supabase database:**
   - Create a new Supabase project
   - Run the SQL from `supabase-schema.sql` in your Supabase SQL editor
   - Enable Row Level Security (RLS) policies

4. **Start the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
wisdom-guide/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── chat/          # Chat endpoint
│   │   │   ├── voice/         # Voice processing
│   │   │   ├── krishna/       # Krishna-specific data
│   │   │   └── conversations/ # Conversation management
│   │   ├── chat/krishna/      # Krishna chat page
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── chat/              # Chat-specific components
│   │   └── voice/             # Voice-related components
│   ├── lib/                   # Utility libraries
│   │   ├── supabase.ts        # Database client & helpers
│   │   ├── openai.ts          # AI integration
│   │   └── utils.ts           # General utilities
│   └── types/                 # TypeScript declarations
├── public/                    # Static assets
├── supabase-schema.sql        # Database schema
└── TODO.md                    # Development roadmap
```

## 🎯 Core Components

### Krishna Character System
- **System Prompt**: Carefully crafted to embody Krishna's wisdom from the Bhagavad Gita
- **Specialties**: Dharma, karma, devotion, duty, detachment, love, purpose
- **Voice**: Warm, compassionate delivery with measured pace
- **Conversation Starters**: Curated questions based on common life challenges

### Multi-Modal Chat
- **Text Chat**: Primary interface with streaming responses
- **Voice Chat**: Speech recognition + text-to-speech synthesis
- **Message Types**: Support for both text and voice messages
- **Context Awareness**: Maintains conversation history across modes

### Database Design
- **Expandable**: Built to support multiple philosophers
- **Anonymous**: Supports conversations without user accounts
- **Insights**: Save meaningful exchanges for reflection
- **Performance**: Optimized queries with proper indexing

## 🔧 API Endpoints

- `POST /api/chat` - Send message to Krishna and get response
- `POST /api/voice/transcribe` - Convert speech to text
- `POST /api/voice/synthesize` - Convert text to speech
- `GET /api/krishna` - Get Krishna's data and conversation starters
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations` - Get user's conversation history

## 🎨 Design System

The app uses a warm, spiritual color palette:
- **Primary**: Orange to yellow gradients (representing divine light)
- **Background**: Soft orange/yellow tints
- **UI**: Clean, modern components with rounded corners
- **Typography**: Clear, readable fonts with proper hierarchy

## 🔒 Privacy & Ethics

- **Anonymous by default**: No personal data required
- **Mental health awareness**: Includes disclaimers and professional resource recommendations
- **Cultural respect**: Authentic representation of spiritual traditions
- **Data protection**: Secure handling of conversation data

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 🛠️ Development

### Adding New Philosophers

The architecture is designed for easy expansion:

1. **Add philosopher data** to the database
2. **Create character prompt** in `/lib/openai.ts`
3. **Add voice configuration** for the character
4. **Create conversation starters** specific to their teachings
5. **Add route** in `/app/chat/[philosopher]/`

### Voice Integration

- Uses OpenAI Whisper for speech-to-text
- Uses OpenAI TTS for text-to-speech
- Supports real-time voice visualization
- Handles browser compatibility gracefully

## 📋 Development Roadmap

See `TODO.md` for detailed development tasks and progress tracking.

### Phase 1 (MVP) - Current
- ✅ Krishna character implementation
- ✅ Multi-modal chat interface
- ✅ Voice integration
- ✅ Database schema
- 🔄 Testing and polish

### Phase 2 (Expansion)
- 🔲 Additional philosophers (Buddha, Socrates, Marcus Aurelius)
- 🔲 User accounts and personalization
- 🔲 Community features
- 🔲 Premium voice options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is built with respect for spiritual traditions and is intended for educational and personal growth purposes.

## 🆘 Support

For issues or questions:
1. Check the `TODO.md` for known issues
2. Review the database schema in `supabase-schema.sql`
3. Ensure all environment variables are properly set
4. Check browser console for client-side errors

---

*Built with ❤️ for seekers of wisdom everywhere*
