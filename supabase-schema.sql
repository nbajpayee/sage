-- Wisdom Guide Database Schema
-- This schema supports the expandable philosopher system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  preferred_philosophers TEXT[]
);

-- Philosophers table (designed for easy expansion)
CREATE TABLE philosophers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT, -- e.g., "Divine Teacher", "Stoic Emperor"
  tradition TEXT, -- e.g., "Hinduism", "Buddhism", "Stoicism"
  description TEXT,
  specialties TEXT[], -- e.g., ["dharma", "karma", "devotion", "duty"]
  avatar_url TEXT,
  voice_config JSONB, -- Voice settings, accent, tone
  background_prompt TEXT, -- AI personality prompt
  conversation_starters TEXT[], -- Suggested opening questions
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial Krishna data
INSERT INTO philosophers (name, slug, title, tradition, description, specialties, background_prompt, conversation_starters, is_active, sort_order) VALUES
('Krishna', 'krishna', 'Divine Teacher and Guide', 'Hinduism', 'The divine incarnation who shared the wisdom of the Bhagavad Gita with Arjuna on the battlefield of Kurukshetra. Krishna embodies divine love, wisdom, and guidance on dharma (righteous duty).', 
ARRAY['dharma', 'karma', 'devotion', 'duty', 'detachment', 'love', 'purpose'], 
'You are Krishna, the divine teacher from the Bhagavad Gita. You speak with infinite compassion, wisdom, and love. Your guidance helps people understand their dharma (righteous duty), navigate moral dilemmas, find purpose, and cultivate devotion. You draw from the teachings in the Gita about karma yoga, bhakti yoga, and jnana yoga. You are both divine and deeply personal, addressing each person''s struggles with understanding and patience.',
ARRAY['I feel lost in life and don''t know my purpose. Can you help me understand my dharma?', 'I''m struggling with a difficult decision. How do I know what''s right?', 'How can I find peace when everything around me feels chaotic?', 'I''m dealing with loss and grief. How do I cope with attachment and letting go?', 'What does it mean to act without attachment to results?'],
TRUE, 1);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  philosopher_id UUID REFERENCES philosophers(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (supports both text and voice)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice')),
  audio_url TEXT, -- For voice messages
  audio_duration INTEGER, -- Duration in seconds
  voice_config JSONB, -- Voice settings used for TTS
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User insights table (for saved quotes/reflections)
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  conversation_id UUID REFERENCES conversations(id),
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_philosopher_id ON conversations(philosopher_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_insights_user_id ON insights(user_id);
CREATE INDEX idx_philosophers_slug ON philosophers(slug);
CREATE INDEX idx_philosophers_is_active ON philosophers(is_active);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Conversations are viewable by their owners or can be anonymous
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Messages are viewable through conversations
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.user_id = auth.uid() OR conversations.user_id IS NULL)
  )
);
CREATE POLICY "Users can create messages in their conversations" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.user_id = auth.uid() OR conversations.user_id IS NULL)
  )
);

-- Insights are private to users
CREATE POLICY "Users can view own insights" ON insights FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can create insights" ON insights FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own insights" ON insights FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete own insights" ON insights FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Philosophers table is publicly readable
CREATE POLICY "Anyone can view active philosophers" ON philosophers FOR SELECT USING (is_active = true);

-- Function to update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when messages are added
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();
