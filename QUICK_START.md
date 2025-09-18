# Quick Start Guide - Test Without Database

Want to test the Wisdom Guide app immediately without setting up Supabase? Follow these steps:

## 🚀 Instant Setup (Demo Mode)

1. **Clone and install:**
```bash
cd wisdom-guide
npm install
```

2. **Create minimal environment file:**
```bash
cp env.example .env.local
```

3. **Add only OpenAI API key to `.env.local`:**
```env
# Minimum required for demo mode
OPENAI_API_KEY=your_openai_api_key_here

# Optional - leave these empty for demo mode
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

4. **Start the app:**
```bash
npm run dev
```

5. **Open http://localhost:3000**

## ✨ What Works in Demo Mode

- ✅ **Landing page** with Krishna introduction
- ✅ **Text conversations** with Krishna (powered by OpenAI)
- ✅ **Conversation starters** and spiritual guidance
- ✅ **Mental health awareness** and disclaimers
- ✅ **Beautiful UI** with spiritual aesthetics
- ⚠️ **Voice features** (requires OpenAI API key)
- ❌ **Conversation history** (requires database)
- ❌ **Saved insights** (requires database)

## 🔧 Demo Mode Features

The app includes fallback data so you can experience:

- **Krishna's Character**: Full personality with Bhagavad Gita wisdom
- **Conversation Starters**: 8 curated questions covering life challenges
- **AI Responses**: Authentic spiritual guidance powered by GPT-4
- **Responsive Design**: Beautiful interface optimized for all devices

## 📝 Sample Conversation Starters

Try asking Krishna about:
- "I feel lost in life and don't know my purpose. Can you help me understand my dharma?"
- "How can I find peace when everything around me feels chaotic?"
- "I'm dealing with loss and grief. How do I cope with attachment and letting go?"
- "What does it mean to act without attachment to results?"

## 🎯 Next Steps

Once you're ready for the full experience:

1. **Set up Supabase** (see main README.md)
2. **Add database credentials** to `.env.local`
3. **Run the SQL schema** from `supabase-schema.sql`
4. **Enjoy persistent conversations** and saved insights

## 🆘 Troubleshooting

**"Error loading Krishna data"** in console?
- This is normal in demo mode - the app will use fallback data

**Chat not working?**
- Make sure you have a valid OpenAI API key in `.env.local`
- Check the browser console for specific error messages

**Voice features not working?**
- Voice requires a valid OpenAI API key
- Some browsers may require HTTPS for microphone access

---

*Demo mode lets you experience Krishna's wisdom immediately while you set up the full database later!*
