# NeuroLearn(Lumina) - AI-Powered Study Platform

A comprehensive study platform featuring AI-powered quizzes, collaborative squad rooms, focus tracking, and wellness features.
## 🚀 Features

- **Squad Rooms**: Real-time collaborative study sessions with chat and synchronized timers
- **AI Quizzes**: Dynamic quiz generation using Gemini AI
- **Focus Tracking**: Pomodoro timers with progress analytics
- **Wellness Dashboard**: Digital wellbeing and mindfulness features
- **Portfolio Showcase**: LeetCode integration and project  displays
- **Coding Arena**: Interactive coding challenges and practice


## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand with persistence
- **Real-time Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **AI Integration**: Google Gemini API
- **Build Tool**: Vite
- **Animations**: Framer Motion


## 📦 Installation

**Prerequisites:** Node.js 16+

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Leojin7/preview.git
   cd preview
   ```


2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Copy `.env.local.example` to `.env.local`
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

4. **Firebase Configuration:**
   - Update Firebase config in `index.html`
   - Ensure Firebase Realtime Database and Auth are enabled

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── portfolio/       # Portfolio-related components
│   ├── wellness/        # Wellness and mindfulness features
│   └── ...
├── pages/              # Main application pages
├── stores/             # Zustand state management
├── services/           # External API integrations
├── constants/          # App constants and configurations
└── types.ts           # TypeScript type definitions
```

## 🔥 Key Features Implemented

### Squad Rooms
- Real-time collaboration with Firebase
- Encrypted chat messaging
- Synchronized pomodoro timers
- Host controls (delete squad)
- Member management

### AI Integration
- Gemini-powered quiz generation
- Dynamic question creation
- Intelligent response evaluation

### State Management
- Persistent storage with Zustand
- Real-time synchronization
- Optimistic updates

## 🚀 Deployment

### Vercel Deployment

The app is optimized for Vercel deployment:

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard:**
   - `VITE_API_KEY` - Your Gemini API key (required)
   - `VITE_ENABLE_IMAGE_GEN` - Enable image generation (optional, default: false)
   - `VITE_ENABLE_SEARCH_TOOL` - Enable search tools (optional, default: false)
   - `VITE_ENABLE_STREAM` - Enable streaming responses (optional, default: false)

3. **Deploy automatically** - Vercel will build and deploy on every push to main

### Manual Build

```bash
npm run build
```

### Environment Variables Required for Production

- **`VITE_API_KEY`** (Required): Your Google Gemini API key
- **Firebase Config**: Already embedded in `index.html`
- **Feature Flags**: Optional, all default to disabled for stability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
