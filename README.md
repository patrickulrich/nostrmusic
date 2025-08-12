# NostrMusic - Discover Bitcoin Music on Nostr

A decentralized music discovery platform built entirely on Nostr protocols, featuring Bitcoin music from Wavlake with a persistent global music player.

![Nostr Music](https://img.shields.io/badge/Nostr-Powered-purple?style=for-the-badge) ![Bitcoin](https://img.shields.io/badge/Bitcoin-Native-orange?style=for-the-badge) ![Lightning](https://img.shields.io/badge/Lightning-Enabled-yellow?style=for-the-badge)

## 🎵 Features

### **Core Music Experience**
- **🎧 Persistent Music Player** - Global bottom-docked player that continues across all page navigation with seamless playback
- **📻 Wavlake Radio** - Custom Bitcoin music radio station with genre filtering and time period selection
- **🎶 Party Mode** - Full-screen immersive music experience with artist info and Lightning QR codes for zapping
- **🏆 Weekly Songs Leaderboard** - Community-driven voting system for top tracks using Nostr events
- **🎵 Music Discovery** - Browse trending tracks, search artists/albums, and discover Bitcoin music
- **⚡ Lightning Zaps** - Direct LNURL integration with Wavlake for seamless Bitcoin payments to artists
- **💡 Track Suggestions** - Users can suggest tracks privately to curators via encrypted NIP-17 messages

### **Nostr Protocol Integration**
- **Complete Profile System** - NIP-05 identity verification and profile management
- **Social Features** - Follow/unfollow with NIP-02, threaded comments with NIP-22
- **Lightning Zaps** - Support artists with instant Bitcoin payments via NIP-57
- **Private Messages** - Secure track suggestions using NIP-17 with NIP-59 gift wrapping
- **Client Attribution** - Automatic client tags on all published events for proper attribution
- **NIP-19 Routing** - Direct access to Nostr content via npub, note, nevent, naddr URLs

### **Content & Social**
- **💬 Comments System** - Threaded discussions on tracks, albums, and artists using NIP-22
- **🏆 Community Voting** - One vote per user system for authentic music rankings using NIP-51
- **📱 Real-time Updates** - Live content updates with optimistic caching via TanStack Query
- **🔔 Notifications** - Track suggestion notifications for content curators

## 🏗️ Technology Stack

### **Frontend Framework**
- **React 18.x** - Latest React with concurrent rendering and hooks
- **TypeScript** - Full type safety throughout the application
- **Vite** - Lightning-fast build tool and development server
- **TailwindCSS 3.x** - Utility-first CSS framework for responsive design

### **UI Components**
- **shadcn/ui** - 48+ beautiful, accessible components built on Radix UI
- **Lucide Icons** - Comprehensive icon library for modern interfaces
- **Responsive Design** - Mobile-first approach with desktop optimization

### **Nostr Integration**
- **Nostrify** - Modern Nostr framework for web applications
- **NIP Standards** - Implements 20+ NIPs for comprehensive functionality
- **TanStack Query** - Powerful data fetching and caching for Nostr events
- **Multi-Relay Support** - Query multiple relays with automatic failover

### **Audio & Media**
- **HTML5 Audio** - Native browser audio with custom persistent player
- **Race Condition Handling** - Proper audio loading sequence for reliable playback
- **CORS Support** - Direct audio streaming from CloudFront CDN
- **URL Processing** - Smart handling of analytics redirects (op3.dev → direct URLs)

## 📁 Project Structure

```
src/
├── components/                    # Reusable UI components
│   ├── ui/                       # shadcn/ui base components (48+ components)
│   ├── music/                    # Music-specific components
│   │   ├── PersistentMusicPlayer.tsx # Global persistent music player
│   │   ├── GlobalTrackList.tsx   # Track listing with playback controls
│   │   ├── SuggestTrackModal.tsx # NIP-17 track suggestions
│   │   └── WavlakeZapDialog.tsx  # Lightning payment interface
│   ├── auth/                     # Authentication components
│   │   ├── LoginArea.tsx         # Main auth interface
│   │   ├── LoginDialog.tsx       # Login modal
│   │   └── AccountSwitcher.tsx   # Multi-account support
│   ├── comments/                 # Comment system (NIP-22)
│   │   ├── CommentsSection.tsx   # Threaded discussions
│   │   ├── Comment.tsx           # Individual comment display
│   │   └── CommentForm.tsx       # Comment creation
│   ├── layout/                   # Layout components
│   │   ├── MainLayout.tsx        # Main app layout
│   │   ├── Header.tsx            # Navigation header
│   │   └── Sidebar.tsx           # Navigation sidebar
│   └── notifications/            # Notification components
├── hooks/                        # Custom React hooks (25+ specialized hooks)
│   ├── useNostr.ts               # Core Nostr integration
│   ├── useGlobalMusicPlayer.ts   # Global music player state
│   ├── useMusicPlayer.ts         # Music player context hook
│   ├── useWavlake.ts             # Wavlake API integration
│   ├── useComments.ts            # Comment queries (NIP-22)
│   ├── useAuthor.ts              # Profile data fetching
│   ├── useCurrentUser.ts         # Authentication state
│   ├── useTrackSuggestionNotifications.ts # NIP-17 private messages
│   └── ...                       # 17+ additional specialized hooks
├── pages/                        # Page components (11 pages)
│   ├── Index.tsx                 # Home page with music discovery
│   ├── WavlakeRadio.tsx          # Custom radio station
│   ├── PartyView.tsx             # Full-screen music player
│   ├── Leaderboard.tsx           # Community voting leaderboard
│   ├── WavlakeTrack.tsx          # Individual track pages
│   ├── WavlakeArtist.tsx         # Artist profiles
│   ├── WavlakeAlbum.tsx          # Album pages
│   ├── NotificationsPage.tsx     # Track suggestion notifications
│   ├── EditProfile.tsx           # Profile editing
│   ├── NIP19Page.tsx             # NIP-19 route handler
│   └── NotFound.tsx              # 404 page
├── contexts/                     # React context providers
│   ├── MusicPlayerContext.tsx    # Global music player state
│   ├── MusicPlayerTypes.ts       # Music player type definitions
│   ├── AppContext.ts             # Global app configuration
│   └── NWCContext.tsx            # Nostr Wallet Connect
├── lib/                          # Utility functions and libraries
│   ├── wavlake.ts                # Wavlake API wrapper
│   ├── addTrackToPicks.ts        # Playlist utilities
│   ├── nip17-proper.ts           # NIP-17 implementation
│   └── utils.ts                  # General utilities
├── test/                         # Testing utilities
│   ├── TestApp.tsx               # Provider wrapper for tests
│   └── setup.ts                  # Test configuration
├── App.tsx                       # Main app with provider setup
├── AppRouter.tsx                 # React Router configuration
└── main.tsx                      # App entry point
```

## 🎯 Supported NIPs

| NIP | Feature | Implementation | Where Used |
|-----|---------|----------------|------------|
| [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) | Basic Protocol | ✅ Core events and relay communication | Foundation for all Nostr functionality |
| [NIP-02](https://github.com/nostr-protocol/nips/blob/master/02.md) | Follow Lists | ✅ Follow/unfollow functionality | `FollowButton`, profile pages |
| [NIP-05](https://github.com/nostr-protocol/nips/blob/master/05.md) | NIP-05 Verification | ✅ Internet identifier verification | Profile editing and display |
| [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md) | Browser Extension | ✅ Web browser wallet integration | Authentication and signing |
| [NIP-17](https://github.com/nostr-protocol/nips/blob/master/17.md) | Private DMs | ✅ Secure track suggestions | Track suggestion system |
| [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) | bech32 Entities | ✅ Root-level routing for npub, note, etc. | `NIP19Page`, URL handling |
| [NIP-22](https://github.com/nostr-protocol/nips/blob/master/22.md) | Comments | ✅ Threaded comment system | `CommentsSection` on all content |
| [NIP-25](https://github.com/nostr-protocol/nips/blob/master/25.md) | Reactions | ✅ Like reactions | Comment and content reactions |
| [NIP-51](https://github.com/nostr-protocol/nips/blob/master/51.md) | Lists | ✅ Music playlists and voting | Playlist management, leaderboard |
| [NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md) | Lightning Zaps | ✅ Bitcoin micropayments | Artist support, `WavlakeZapDialog` |
| [NIP-59](https://github.com/nostr-protocol/nips/blob/master/59.md) | Gift Wrapping | ✅ Privacy-preserving message sealing | Private message encryption |
| [NIP-78](https://github.com/nostr-protocol/nips/blob/master/78.md) | App Data | ✅ Notification read status | `NotificationsPage` |
| [NIP-89](https://github.com/nostr-protocol/nips/blob/master/89.md) | Client Tags | ✅ Automatic client attribution | All published events |

## 🎵 Music Player Architecture

The application features a sophisticated global music player system:

### **PersistentMusicPlayer**
- **Global State**: Managed via `MusicPlayerContext` with React Context
- **Persistent Playback**: Continues across all page navigation
- **Smart Visibility**: Automatically hides on fullscreen pages (Radio/Party modes)
- **Audio Handling**: Robust playback with proper loading sequence and error handling
- **CORS Optimization**: Direct CloudFront URL extraction from analytics redirects

### **Global Music Hooks**
- **`useMusicPlayer`**: Direct access to music player context
- **`useGlobalMusicPlayer`**: Simplified interface for common operations
- **Track Management**: Playlist support with next/previous controls
- **State Synchronization**: Real-time state updates across components

### **Audio Processing**
- **URL Extraction**: Smart processing of op3.dev analytics URLs to direct CloudFront links
- **Race Condition Prevention**: Proper audio loading sequence prevents playback interruption
- **Error Handling**: Graceful fallback for failed track loads
- **Cross-Origin Support**: Optimized for CDN audio streaming

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** - Latest LTS version recommended
- **npm** - Package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/patrickulrich/nostrmusic.git
cd nostrmusic

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:8080
```

### Build for Production

```bash
# Run all tests and create optimized build
npm test

# Create build only
npm run build

# Deploy to Nostr
npm run deploy
```

## 🎯 Key Features by Page

### **Home Page (`/`)**
- Music discovery with trending tracks
- Search functionality for tracks, artists, albums
- Tabbed interface (Discover/Search)
- Genre and time period filtering
- Track voting and suggestion system
- Direct access to Radio and Party modes

### **Wavlake Radio (`/radio`)**
- Custom Bitcoin music radio station
- Genre-based filtering
- Automatic playlist generation
- Fullscreen immersive experience
- Shuffle and continuous play

### **Party Mode (`/party-view`)**
- Full-screen music visualization
- Large artist information display
- Lightning QR codes for instant zapping
- Immersive party atmosphere

### **Leaderboard (`/leaderboard`)**
- Community-driven track rankings
- Real-time vote counting
- Weekly reset system
- Voter transparency with modal details

### **Track Pages (`/wavlake/:trackId`)**
- Detailed track information
- Artist and album navigation
- Lightning zap integration
- Comment system
- Track suggestion functionality

## 🔧 Development

### Testing
```bash
# Run complete test suite (TypeScript + ESLint + Vitest + Build)
npm test

# Development mode
npm run dev
```

### Adding Features
- **New Components**: Add to appropriate `src/components/` subdirectory
- **New Pages**: Create in `src/pages/` and update `AppRouter.tsx`
- **New Hooks**: Add custom hooks in `src/hooks/`
- **Nostr Integration**: Extend existing hooks or create new ones for additional NIPs

### Configuration
- **Relay Settings**: Configure in `src/components/NostrProvider.tsx`
- **Theme System**: Customize in `tailwind.config.ts`
- **Build Settings**: Configure in `vite.config.ts`

## 🌐 Deployment

The application is configured for automatic deployment:

```bash
# Deploy to Nostr via nostr-deploy-cli
npm run deploy
```

Environment is configured for:
- **Base Path**: Configurable via `VITE_BASE_PATH`
- **Host**: Configured for `nostrmusic.com`
- **Static Assets**: Optimized build with 404 fallback

## 🙏 Acknowledgments

- **Nostr Community** - Protocol development and standards
- **Wavlake** - Bitcoin music streaming platform
- **shadcn/ui** - Beautiful component library
- **Nostrify** - Modern Nostr framework
- **MKStack** - Development foundation

---

**Built with ❤️ on Nostr** | **Powered by Bitcoin** | **Vibed with [MKStack](https://soapbox.pub/mkstack)**