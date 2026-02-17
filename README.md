# 🌍 G.O (Go Out) — AI-Powered Urban Discovery Platform

<a href="https://github.com/BryanBradfo/g.o/releases"><img src="https://img.shields.io/github/v/release/BryanBradfo/g.o?include_prereleases&style=for-the-badge" alt="Release"></a>
<a href="#license"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License"></a>
<a href="https://react.dev/"><img src="https://img.shields.io/badge/Made%20with-React-61dafb.svg?style=for-the-badge" alt="React"></a>
<a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4.svg?style=for-the-badge" alt="Gemini AI"></a>

**Never argue about "what to do tonight" again! G.O uses AI to discover the perfect activities based on your squad's collective vibe, budget, and location. Built for Team 56 with React ⚛️ and Google Gemini AI ✨**

---

<div align="center">
<img width="1200" height="475" alt="g_o" src="https://github.com/user-attachments/assets/968b0c63-fd0f-4a35-bb35-da35c9162d31" />
</div>

---

## The Problem

Planning a night out with friends is frustrating:
- **Decision paralysis** — Everyone has different preferences
- **Budget conflicts** — One person wants fancy dining, another wants budget-friendly
- **Location hassles** — Finding something nearby that everyone likes
- **Time waste** — Scrolling through endless options on multiple apps
- **Compromise fatigue** — Settling for something no one is excited about

**G.O** solves this by analyzing everyone's interests, your location, and budget constraints to suggest the perfect activities — powered by AI.

## Features

- **🤖 AI-Powered Recommendations** — Google Gemini AI analyzes your squad's collective preferences
- **👥 Squad Mode** — Add friends with their unique interests and vibes
- **💰 Smart Budget Filtering** — Set budget constraints (Low, Moderate, Premium, Luxury)
- **📍 Location-Aware** — Automatically detects your location or set it manually
- **🗺️ Interactive Map** — Visualize activities on a beautiful map interface
- **🎯 Advanced Filtering** — Exclude specific categories (nightclubs, seafood, museums, etc.)
- **🎉 Host Events** — Create and broadcast your own public events
- **📱 Responsive Design** — Works seamlessly on desktop and mobile
- **⚡ Real-time Updates** — Get fresh suggestions instantly
- **🎨 Modern UI** — Beautiful, intuitive interface with smooth animations

## Tech Stack

G.O is built with cutting-edge web technologies:

| Technology | Purpose |
|-----------|---------|
| ⚛️ **React 19** | UI framework with latest features |
| 📘 **TypeScript** | Type-safe development |
| ⚡ **Vite** | Lightning-fast build tool |
| 🤖 **Google Gemini AI** | Intelligent activity recommendations |
| 🎨 **Lucide Icons** | Beautiful, consistent iconography |
| 🗺️ **Custom Map Component** | Interactive location visualization |

## Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/BryanBradfo/g.o.git
cd g.o

# Install dependencies
npm install

# Create environment file
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Usage

### 1️⃣ Find Activities

**Set Your Location**

Enter your city or let the app detect your location automatically

**Build Your Squad**

Add friends with their names and interests:
- Alice: "loves art galleries and coffee shops"
- Bob: "into sports bars and live music"
- Carol: "vegan foodie, hates crowds"

**Set Your Budget**

Choose from: `Low` | `Moderate` | `Premium` | `Luxury`

**Get Recommendations**

Click "Find Activities" and let AI work its magic! ✨

### 2️⃣ Advanced Filters

Click "Advanced Settings" to exclude specific categories:
- 🎵 Nightclubs / Loud Music
- 🍺 Alcohol / Bars
- ⚽ Sports / Physical Activities
- 🏛️ Museums / History
- 🦞 Seafood
- 🍔 Fast Food
- 🥾 Walking / Hiking
- 👥 Crowded Places
- 💎 Expensive Entry
- 🌱 Vegan Only

### 3️⃣ Host Events

Switch to the "Host" tab to create your own public events:

- **Event Name**: "Rooftop Sunset Party"
- **Category**: Social
- **Price**: "€15 entry"
- **Description**: "Join us for cocktails and city views!"

Broadcast it to everyone on G.O! 📢

## Project Structure

```
g.o/
├── components/          # React components
│   ├── ActivityCard.tsx # Activity display card
│   ├── Loader3D.tsx    # Loading animation
│   └── MapVisual.tsx   # Interactive map component
├── services/           # API and external services
│   └── geminiService.ts # Google Gemini AI integration
├── App.tsx            # Main application component
├── types.ts           # TypeScript type definitions
├── index.tsx          # Application entry point
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
└── tsconfig.json      # TypeScript configuration
```

## How It Works

1. **Input Collection** — User enters location, squad members with interests, and budget
2. **Preference Analysis** — AI analyzes collective preferences, exclusions, and constraints
3. **Activity Generation** — Gemini AI suggests relevant activities with details
4. **Location Mapping** — Activities are geocoded and displayed on an interactive map
5. **Sorting & Filtering** — Results can be sorted by match score, distance, or price
6. **Selection** — Users can view details, see exact locations, and make informed decisions

## Architecture

G.O uses a modern, component-based architecture:

- **State Management**: React hooks (useState, useEffect)
- **API Integration**: Google Gemini AI for intelligent recommendations
- **Geolocation**: Browser Geolocation API for automatic location detection
- **Type Safety**: Full TypeScript coverage with strict mode
- **Build Tool**: Vite for fast development and optimized production builds

## Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## Roadmap

- [x] Core AI recommendation engine
- [x] Squad preference aggregation
- [x] Budget-based filtering
- [x] Interactive map visualization
- [x] Custom event hosting
- [x] Advanced category exclusions
- [ ] User authentication & profiles
- [ ] Save favorite activities
- [ ] Share recommendations via link
- [ ] Social features (comments, ratings)
- [ ] Calendar integration
- [ ] Weather-aware suggestions
- [ ] Multi-city support
- [ ] Mobile app (React Native)
- [ ] Group voting on activities
- [ ] Integration with booking platforms

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please ensure your code:
- Follows the existing code style
- Includes TypeScript types
- Is tested locally before submitting
- Includes comments for complex logic

## Star This Repo!

If you find G.O useful, give it a ⭐ — it helps others discover the project and motivates continued development!

<a href="https://star-history.com/#BryanBradfo/g.o&Date">
  <img src="https://api.star-history.com/svg?repos=BryanBradfo/g.o&type=Date" alt="Star History Chart" />
</a>

## Team

**Team 56** — Building tools to make social planning effortless.

## License

This project is licensed under the MIT License.

---

**View the app in AI Studio**: [https://ai.studio/apps/drive/1357sSZkYS28rsAgOqSVzsauM_X8Xp8Fn](https://ai.studio/apps/drive/1357sSZkYS28rsAgOqSVzsauM_X8Xp8Fn)

Made with ❤️ by Team 56
