# AI Tweet Helper Chrome Extension

A Chrome extension built with Next.js that uses AI to help you craft better tweets and replies on Twitter/X.

## 🚀 Features

- **Smart Replies**: Generate contextual replies to tweets
- **Tweet Enhancement**: Improve your draft tweets with AI suggestions
- **One-Click Integration**: Easy-to-use interface directly on Twitter/X
- **Secure API Key Storage**: Your OpenAI API key is stored locally in the extension

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your OpenAI API key:**
   - Edit `.env.local` and add your OpenAI API key

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Load the extension in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `extension` folder that was created

### Using the Extension

1. **Set up your API key:**
   - Click the extension icon in your Chrome toolbar
   - Click the settings gear ⚙️
   - Enter your OpenAI API key
   - Click "Save"

2. **Use on Twitter/X:**
   - Go to [twitter.com](https://twitter.com) or [x.com](https://x.com)
   - When composing a tweet or reply, look for the "🤖 AI Help" button
   - Click it to get AI-powered suggestions

## 🔧 Development

### Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build both Next.js app and extension
- `npm run build:extension` - Build extension only
- `npm run lint` - Run ESLint

#https://x.com/FelipeOtar40115

<img width="632" height="858" alt="image" src="https://github.com/user-attachments/assets/9d59f0bb-36ce-4536-ae34-3893780d9513" />


After making changes, run `npm run build` and reload the extension in Chrome.
