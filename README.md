# PeachyHODL - Peachy's Personal Nostr Website

A decentralized personal website and social platform built entirely on Nostr protocols, showcasing Bitcoin music, live streaming, blog content, and community features.

![Peachy's Nostr Website](https://img.shields.io/badge/Nostr-Powered-purple?style=for-the-badge) ![Bitcoin](https://img.shields.io/badge/Bitcoin-Native-orange?style=for-the-badge) ![Lightning](https://img.shields.io/badge/Lightning-Enabled-yellow?style=for-the-badge)

## 🎵 Features

### **Core Nostr Integration**
- **Complete Profile System** - NIP-05 identity verification and profile management
- **Social Features** - Follow/unfollow with NIP-02, post comments with NIP-22
- **Lightning Zaps** - Support Peachy with instant Bitcoin payments via NIP-57
- **Client Attribution** - Automatic client tags on all published events for proper attribution
- **Decentralized Storage** - All content lives on Nostr relays, no central servers

### **Music & Entertainment**
- **🎧 Wavlake Music Integration** - Stream Bitcoin music with NIP-51 playlists and full track/artist/album browsing
- **🎵 Advanced Music Player** - Full-featured music player with playlist support, next/previous controls, and persistent state
- **📻 Live Audio Rooms** - Real-time voice chat using NIP-100 WebRTC with moderation tools and participant management
- **🎥 Live Streaming** - NIP-53 live events with integrated chat and streaming controls
- **🎶 Party View** - Full-screen music experience with artist info and Lightning QR codes for zapping
- **🏆 Weekly Song Leaderboard** - Community-driven voting system for top tracks using kind 30003 events
- **🎤 Single-Vote System** - One vote per user for authentic community-driven music rankings using NIP-51 replaceable events
- **💡 Track Suggestions** - Users can suggest tracks to Peachy with messaging system

### **Content & Media**
- **📝 Long-form Blog** - NIP-23 articles with rich content, images, and featured post highlighting
- **📸 Photo Galleries** - NIP-68 picture feeds with responsive grid layout and lightbox viewing
- **📅 Event Calendar** - Upcoming and past live events via NIP-53 with status tracking
- **💬 Advanced Comments System** - Threaded discussions on all content using NIP-22
- **🔗 NIP-19 Routing** - Direct access to any Nostr content via npub, note, nevent, naddr URLs
- **📱 Unified Chat** - Global livestream chat system with real-time messaging

### **Admin Features** 
- **Content Management** - Special admin controls when Peachy is signed in
- **Music List Management** - Create, manage, and update Wavlake music playlists with NIP-51
- **Audio Room Moderation** - Voice chat moderation with kick/ban functionality and moderator permissions
- **Track Suggestion Notifications** - Dedicated notification system for track suggestions from users
- **Profile Management** - Complete profile editing with NIP-05 verification support
- **Real-time Updates** - Live content updates across all sections with optimistic caching

## 🏗️ Technology Stack

### **Frontend Framework**
- **React 18.x** - Latest React with concurrent rendering and hooks
- **TypeScript** - Full type safety throughout the application
- **Vite** - Lightning-fast build tool and development server
- **TailwindCSS 3.x** - Utility-first CSS framework for responsive design

### **UI Components**
- **shadcn/ui** - 40+ beautiful, accessible components built on Radix UI
- **Lucide Icons** - Comprehensive icon library for modern interfaces
- **Custom Components** - Specialized music players, photo galleries, and more

### **Nostr Integration**
- **Nostrify** - Modern Nostr framework for web applications
- **NIP Standards** - Implements 19+ NIPs for comprehensive functionality
- **TanStack Query** - Powerful data fetching and caching for Nostr events
- **Multi-Relay Support** - Query multiple relays with automatic failover

### **Audio & Media**
- **HTML5 Audio** - Native browser audio with full playback controls and waveform visualization
- **WebRTC** - Peer-to-peer voice chat for audio rooms with NRTC implementation patterns
- **Image Optimization** - Responsive images with lazy loading and progressive enhancement
- **File Upload** - Blossom server integration for media storage with NIP-96 support
- **Lightning Integration** - QR code generation for zapping artists and supporting Bitcoin music

## 📋 Supported NIPs

| NIP | Feature | Implementation | Where Used |
|-----|---------|----------------|------------|
| [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) | Basic Protocol | ✅ Core events, signatures, and relay communication | **Hooks**: `useNostr`, `useNostrPublish`, `useAuthor` **Pages**: All pages **Core**: Foundation for all Nostr functionality |
| [NIP-02](https://github.com/nostr-protocol/nips/blob/master/02.md) | Follow Lists | ✅ Follow/unfollow functionality | **Component**: `FollowButton` **Hook**: `useFollows` **Pages**: About, Index, LiveStreamToolbar |
| [NIP-04](https://github.com/nostr-protocol/nips/blob/master/04.md) | Encrypted DMs | ✅ Content encryption for WebRTC signaling | **Component**: `AudioRoom` **Hook**: `useNIP100` **Lib**: WebRTC signaling encryption |
| [NIP-05](https://github.com/nostr-protocol/nips/blob/master/05.md) | NIP-05 Verification | ✅ Internet identifier verification | **Component**: `EditProfileForm` **Pages**: About, profile display **Feature**: Identity verification |
| [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md) | Browser Extension | ✅ Web browser wallet integration | **Component**: `LoginArea` **Hook**: `useCurrentUser` **Core**: All signing operations via browser extension |
| [NIP-10](https://github.com/nostr-protocol/nips/blob/master/10.md) | Text Events and Threads | ✅ Reply references for comments and threading | **Component**: `NoteContent` **Hook**: `usePostComment` **Feature**: Comment threading structure |
| [NIP-17](https://github.com/nostr-protocol/nips/blob/master/17.md) | Private DMs | ✅ Secure track suggestions via gift wrap | **Components**: `SuggestTrackModal`, `SuggestTrackModalControlled` **Hook**: `useTrackSuggestionNotifications` **Lib**: `nip17-proper.ts` |
| [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) | bech32 Entities | ✅ Root-level routing for npub, note, nevent, naddr | **Page**: `NIP19Page` **Router**: `AppRouter.tsx` **Components**: `NoteContent`, URL handling throughout app |
| [NIP-21](https://github.com/nostr-protocol/nips/blob/master/21.md) | URI Scheme | ✅ nostr: URI parsing and handling | **Component**: `NoteContent` **Feature**: URL parsing and link handling |
| [NIP-27](https://github.com/nostr-protocol/nips/blob/master/27.md) | Text Note References | ✅ Mention notifications and user tagging | **Component**: `LiveStreamToolbar` **Feature**: User mentions in posts |
| [NIP-22](https://github.com/nostr-protocol/nips/blob/master/22.md) | Comments | ✅ Threaded comment system | **Component**: `CommentsSection` **Hooks**: `useComments`, `usePostComment` **Feature**: Comments on all content types |
| [NIP-23](https://github.com/nostr-protocol/nips/blob/master/23.md) | Long-form Content | ✅ Blog articles and rich content | **Page**: `Blog` **Hook**: `useBlogPosts` **Kind**: 30023 for articles |
| [NIP-51](https://github.com/nostr-protocol/nips/blob/master/51.md) | Lists | ✅ Music playlists and curation sets | **Components**: `ManagePicksDialog`, `AddToPlaylistButton` **Hook**: `useMusicLists` **Pages**: WeeklySongsLeaderboard, WavlakePicks |
| [NIP-53](https://github.com/nostr-protocol/nips/blob/master/53.md) | Live Activities | ✅ Live streams and events | **Pages**: Events, live streaming **Hooks**: `useLiveEvents`, `useLiveStream`, `useLiveChat` **Components**: Live chat systems |
| [NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md) | Lightning Zaps | ✅ Bitcoin micropayments | **Component**: `ZapButton` **Hooks**: `useZaps`, `useZapNotifications` **Pages**: PartyView, music pages **Feature**: Lightning payments |
| [NIP-44](https://github.com/nostr-protocol/nips/blob/master/44.md) | Versioned Encryption | ✅ Modern encryption for private messages | **Components**: Track suggestion modals **Lib**: `nip17-proper.ts` **Feature**: Secure private messaging |
| [NIP-46](https://github.com/nostr-protocol/nips/blob/master/46.md) | Remote Signing | ✅ Bunker URI support for remote signers | **Hook**: `useCurrentUser`, `useLoginActions` **Component**: `LoginArea` **Feature**: Remote wallet connections |
| [NIP-59](https://github.com/nostr-protocol/nips/blob/master/59.md) | Gift Wrapping | ✅ Privacy-preserving message sealing | **Lib**: `nip17-proper.ts`, `nip17.ts` **Feature**: Encrypted message wrapping for NIP-17 |
| [NIP-68](https://github.com/nostr-protocol/nips/blob/master/68.md) | Picture Feeds | ✅ Photo galleries with imeta tags | **Page**: `Photos` **Hook**: `usePictures` **Kind**: 20 for picture events **Component**: `PictureGrid` |
| [NIP-78](https://github.com/nostr-protocol/nips/blob/master/78.md) | App Data | ✅ Notification read status persistence | **Hook**: `useNotificationReadStatus` **Page**: NotificationsPage **Feature**: Read status tracking |
| [NIP-89](https://github.com/nostr-protocol/nips/blob/master/89.md) | Client Tags | ✅ Automatic client attribution on published events | **Hook**: `useNostrPublish` **Feature**: Automatic client tagging on all published events |
| [NIP-94](https://github.com/nostr-protocol/nips/blob/master/94.md) | File Metadata | ✅ Media file handling | **Hook**: `useUploadFile` **Components**: File upload components **Feature**: Media metadata |
| [NIP-96](https://github.com/nostr-protocol/nips/blob/master/96.md) | File Storage | ✅ Blossom server uploads | **Hook**: `useUploadFile` **Components**: `EditProfileForm`, `IconSelector`, `SignupDialog` **Feature**: File storage |
| [NIP-100](https://github.com/chakany/nips/blob/webrtc/100.md) | WebRTC Audio | ✅ Real-time voice chat with moderation | **Component**: `AudioRoom` **Hook**: `useNIP100` **Page**: AudioRooms **Kind**: 25050 for signaling |
| **Custom NIP-31337** | Music Standard | ✅ Proposed native music format | **Future**: Native Nostr music standard implementation **Kind**: 31337 |
| **Custom NIP-32123** | Wavlake Music | ✅ Bitcoin music compatibility | **Components**: Music player, track components **Pages**: WavlakeTrack, WavlakeAlbum, WavlakeArtist **Hook**: `useWavlake` |

### Custom Features

| Feature | Description | Implementation | Where Used |
|---------|-------------|----------------|------------|
| **Single-Vote System** | One-vote-per-user track rankings via NIP-51 replaceable events | **Pages**: WeeklySongsLeaderboard, WavlakeTrack, WavlakeExplore **Hook**: Voting via `useNostrPublish` **Kind**: 30003 with d-tag "peachy-song-vote" |

## 🎯 Event Kinds Reference

This table shows all Nostr event kinds used throughout the application with their specific implementations:

| Kind | Type | NIP | Description | Primary Usage | Implementation |
|------|------|-----|-------------|---------------|----------------|
| **0** | Replaceable | [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) | User metadata/profile | Profile information | **Hook**: `useAuthor` **Components**: `EditProfileForm`, `SignupDialog` **Feature**: User profiles |
| **1** | Regular | [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) | Short text notes | Social posts, messages | **Component**: `LiveStreamToolbar` **Hook**: `useNostrPublish` **Feature**: Social posting |
| **3** | Replaceable | [NIP-02](https://github.com/nostr-protocol/nips/blob/master/02.md) | Contact/follow lists | Follow relationships | **Hook**: `useFollows` **Component**: `FollowButton` **Feature**: Social connections |
| **4** | Regular | [NIP-04](https://github.com/nostr-protocol/nips/blob/master/04.md) | Encrypted DMs (legacy) | Fallback encrypted messaging | **Lib**: `nip17.ts` **Feature**: Legacy encrypted messaging |
| **13** | Regular | [NIP-59](https://github.com/nostr-protocol/nips/blob/master/59.md) | Seal (encrypted) | Gift wrap message sealing | **Lib**: `nip17-proper.ts` **Feature**: Message privacy layer |
| **14** | Regular | [NIP-17](https://github.com/nostr-protocol/nips/blob/master/17.md) | Chat message (rumor) | Private message content | **Lib**: `nip17-proper.ts` **Feature**: Private message payload |
| **20** | Regular | [NIP-68](https://github.com/nostr-protocol/nips/blob/master/68.md) | Picture events | Photo galleries | **Hook**: `usePictures` **Page**: Photos **Component**: `PictureGrid` |
| **1059** | Regular | [NIP-59](https://github.com/nostr-protocol/nips/blob/master/59.md) | Gift wrap | Private message envelope | **Lib**: `nip17-proper.ts` **Hook**: `useTrackSuggestionNotifications` **Feature**: Encrypted message delivery |
| **1111** | Regular | [NIP-22](https://github.com/nostr-protocol/nips/blob/master/22.md) | Comments | Threaded discussions | **Hook**: `useComments`, `usePostComment` **Component**: `CommentsSection` **Feature**: Comment system |
| **1311** | Regular | [NIP-53](https://github.com/nostr-protocol/nips/blob/master/53.md) | Live chat messages | Livestream chat | **Hook**: `useLiveChat` **Components**: `LiveChat`, `UnifiedLivestreamChat` **Feature**: Live chat |
| **9735** | Regular | [NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md) | Zap receipts | Lightning payment confirmations | **Hook**: `useZaps`, `useZapNotifications` **Component**: `ZapButton` **Feature**: Payment tracking |
| **25050** | Regular | [NIP-100](https://github.com/chakany/nips/blob/webrtc/100.md) | WebRTC signaling | Voice chat coordination | **Hook**: `useNIP100` **Component**: `AudioRoom` **Feature**: Real-time voice communication |
| **30003** | Addressable | [NIP-51](https://github.com/nostr-protocol/nips/blob/master/51.md) | Bookmark sets | Curated link collections, voting | **Hook**: `usePeachyLinktree` **Pages**: WeeklySongsLeaderboard, WavlakeTrack **Feature**: Bookmarks and voting |
| **30004** | Addressable | [NIP-51](https://github.com/nostr-protocol/nips/blob/master/51.md) | Curation sets | Music playlists and collections | **Hook**: `useMusicLists` **Component**: `ManagePicksDialog` **Feature**: Music curation |
| **30005** | Addressable | [NIP-51](https://github.com/nostr-protocol/nips/blob/master/51.md) | Interest sets | Topic-based collections | **Hook**: `useMusicLists` **Feature**: Content categorization (potential) |
| **30023** | Addressable | [NIP-23](https://github.com/nostr-protocol/nips/blob/master/23.md) | Long-form articles | Blog posts and articles | **Hook**: `useBlogPosts` **Page**: Blog **Feature**: Long-form content publishing |
| **30024** | Addressable | [NIP-23](https://github.com/nostr-protocol/nips/blob/master/23.md) | Draft articles | Unpublished blog content | **Hook**: `useBlogPosts` **Feature**: Draft content management |
| **30078** | Addressable | [NIP-78](https://github.com/nostr-protocol/nips/blob/master/78.md) | App-specific data | Notification read status | **Hook**: `useNotificationReadStatus` **Page**: NotificationsPage **Feature**: App state persistence |
| **30311** | Addressable | [NIP-53](https://github.com/nostr-protocol/nips/blob/master/53.md) | Live events | Livestream definitions | **Hook**: `useLiveEvents`, `useLiveStream` **Pages**: Events, Index **Feature**: Live streaming events |
| **31337** | Addressable | [Custom NIP](./NIP.md#nip-31337-proposed-music-standard-events) | Proposed music standard | Future music events | **Hook**: `useMusicLists` **Feature**: Native Nostr music format (proposed) |
| **32123** | Addressable | [Custom NIP](./NIP.md#nip-32123-music-track-events-wavlake-compatibility) | Wavlake music tracks | Bitcoin music integration | **Hook**: `useMusicLists` **Pages**: WavlakeTrack, WavlakeAlbum **Feature**: Wavlake music compatibility |

### Event Kind Categories

- **Regular Events** (1000 ≤ kind < 10000): Stored permanently by relays
- **Replaceable Events** (10000 ≤ kind < 20000): Only latest per pubkey+kind is kept  
- **Addressable Events** (30000 ≤ kind < 40000): Latest per pubkey+kind+d-tag combination
- **Legacy Kinds** (<1000): Special cases with individual storage rules

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** - Latest LTS version recommended
- **npm or yarn** - Package manager
- **Git** - Version control

### Installation

```bash
# Clone the repository
git clone https://github.com/patrickulrich/peachyhodl.git
cd peachyhodl

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## 🎨 Customization

### Configuration
- **Relay Settings** - Configure default Nostr relays in `src/contexts/AppContext.ts`
- **Theme System** - Customize colors and styling in `tailwind.config.ts`
- **User Settings** - Modify user preferences and app behavior

### Adding Features
- **New NIPs** - Extend Nostr functionality by implementing additional NIPs
- **Components** - Add custom UI components in `src/components/`
- **Pages** - Create new pages in `src/pages/` and update routing (19+ pages currently implemented)
- **Hooks** - Build custom React hooks for Nostr data in `src/hooks/` (25+ specialized hooks available)
- **WebRTC Integration** - Implement NIP-100 compatible voice chat following chakany's specification

## 🔧 Development

### Project Structure

```
src/
├── components/                    # Reusable UI components (50+ components)
│   ├── ui/                       # shadcn/ui base components (40+ components)
│   │   ├── button.tsx           # Button with variants and sizes
│   │   ├── card.tsx             # Container components
│   │   ├── dialog.tsx           # Modal overlays
│   │   ├── form.tsx             # Form validation components
│   │   ├── input.tsx            # Text input fields
│   │   ├── skeleton.tsx         # Loading placeholders
│   │   └── ...                  # 35+ more shadcn/ui components
│   ├── music/                    # Music-specific components
│   │   ├── MusicPlayer.tsx      # Main audio player with voting
│   │   ├── TrackList.tsx        # Track display components  
│   │   ├── ManagePicksDialog.tsx # Playlist management
│   │   ├── AddToPlaylistButton.tsx
│   │   ├── SuggestTrackModal.tsx # NIP-17 track suggestions
│   │   └── SuggestTrackModalControlled.tsx
│   ├── auth/                     # Authentication components
│   │   ├── LoginArea.tsx        # Main auth interface
│   │   ├── LoginDialog.tsx      # Login modal
│   │   ├── SignupDialog.tsx     # Account creation
│   │   └── FollowButton.tsx     # Social following
│   ├── audio/                    # WebRTC voice chat (NIP-100)
│   │   ├── AudioRoom.tsx        # Voice chat implementation
│   │   └── AudioRoomBrowser.tsx # Room discovery
│   ├── comments/                 # Comment system (NIP-22)
│   │   └── CommentsSection.tsx  # Threaded discussions
│   ├── livestream/               # Live streaming (NIP-53)
│   │   ├── LiveChat.tsx         # Live chat interface
│   │   ├── LiveStreamToolbar.tsx # Stream controls
│   │   ├── UnifiedLivestreamChat.tsx
│   │   └── LivestreamChat.tsx   # Chat message handling
│   └── ...                      # Layout, NoteContent, EditProfileForm, etc.
├── hooks/                        # Custom React hooks (25+ specialized hooks)
│   ├── useNostr.ts              # Core Nostr integration
│   ├── useNostrPublish.ts       # Event publishing with client tags
│   ├── useAuthor.ts             # Profile data fetching
│   ├── useCurrentUser.ts        # Authentication state
│   ├── useFollows.ts            # Social relationships (NIP-02)
│   ├── useComments.ts           # Comment queries (NIP-22)
│   ├── usePostComment.ts        # Comment publishing
│   ├── useBlogPosts.ts          # Long-form content (NIP-23)
│   ├── usePictures.ts           # Photo galleries (NIP-68)
│   ├── useLiveEvents.ts         # Live streaming (NIP-53)
│   ├── useLiveStream.ts         # Stream queries
│   ├── useLiveChat.ts           # Live chat messages
│   ├── useZaps.ts               # Lightning payments (NIP-57)
│   ├── useZapNotifications.ts   # Zap receipt handling
│   ├── useMusicLists.ts         # Playlist management (NIP-51)
│   ├── useNIP100.ts             # WebRTC signaling
│   ├── useTrackSuggestionNotifications.ts # NIP-17 private messages
│   ├── useNotificationReadStatus.ts # NIP-78 app data
│   ├── useUploadFile.ts         # File uploads (NIP-96)
│   └── ...                      # 10+ additional specialized hooks
├── pages/                        # Page components (19+ pages)
│   ├── Index.tsx                # Home page with live streams
│   ├── About.tsx                # Profile page
│   ├── Blog.tsx                 # Long-form content (NIP-23)
│   ├── Photos.tsx               # Photo gallery (NIP-68)
│   ├── Events.tsx               # Event calendar (NIP-53)
│   ├── AudioRooms.tsx           # Voice chat rooms (NIP-100)
│   ├── WavlakePicks.tsx         # Curated music (NIP-51)
│   ├── WavlakeTrack.tsx         # Individual tracks
│   ├── WavlakeAlbum.tsx         # Album pages
│   ├── WavlakeArtist.tsx        # Artist profiles
│   ├── WavlakeExplore.tsx       # Music discovery
│   ├── WeeklySongsLeaderboard.tsx # Community voting
│   ├── PartyView.tsx            # Full-screen music player
│   ├── EditProfile.tsx          # Profile editing
│   ├── NotificationsPage.tsx    # Admin notifications
│   ├── NIP19Page.tsx            # NIP-19 route handler
│   ├── NotFound.tsx             # 404 page
│   └── ...                      # Chat, LiveStreamPage
├── contexts/                     # React context providers
│   ├── AppContext.tsx           # Global app state and relay config
│   └── NWCContext.tsx           # Nostr Wallet Connect
├── lib/                         # Utility functions and libraries
│   ├── nip17-proper.ts          # NIP-17 implementation with NIP-59
│   ├── nip17.ts                 # Alternative NIP-17 implementation
│   ├── addTrackToPicks.ts       # Playlist utilities
│   ├── utils.ts                 # General utilities (cn, etc.)
│   └── ...                      # Date utils, formatters, etc.
├── test/                         # Testing utilities
│   └── TestApp.tsx              # Provider wrapper for tests
├── App.tsx                       # Main app with providers
├── AppRouter.tsx                 # React Router configuration
├── main.tsx                      # App entry point
└── index.css                     # Global styles and CSS variables
```

### Key Architectural Patterns

- **Hook-Based Architecture**: 25+ specialized hooks encapsulate Nostr functionality
- **Component Composition**: shadcn/ui base + specialized feature components  
- **Event-Driven**: Real-time Nostr subscriptions with TanStack Query caching
- **Type Safety**: Full TypeScript coverage with proper Nostr event typing
- **Provider Pattern**: Centralized state management with React contexts

### Key Components
- **`MusicPlayer`** - Full-featured audio player with playlist support, next/previous, and persistent state
- **`TrackList`** - Interactive track listing with play controls and zap integration
- **`AudioRoom`** - WebRTC voice chat implementation with NRTC patterns and moderation
- **`CommentsSection`** - Threaded comment system for any content using NIP-22
- **`LoginArea`** - Complete authentication interface with multi-account support
- **`LiveStreamPlayer`** - Live streaming with HLS support and participant tracking
- **`PictureGrid`** - Responsive photo gallery with lightbox functionality
- **`ManagePicksDialog`** - Music playlist management for content creators

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test src/hooks/useMusicLists.test.ts
```

## 🌐 Deployment

### GitHub Pages
Automatically deploys on push to `main` branch via GitHub Actions.

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting provider
```

### Environment Variables
```env
VITE_DEFAULT_RELAY_URL=wss://relay.nostr.band
VITE_BLOSSOM_SERVER_URL=https://blossom.server.com
```

## 📄 Page Structure

The site includes 19+ specialized pages covering all aspects of Bitcoin music and Nostr interaction:

### **Main Pages**
- **Home** (`/`) - Live streams, recent photos, and featured Wavlake picks
- **Blog** (`/blog`) - Long-form NIP-23 articles with featured content
- **Photos** (`/photos`) - Complete photo gallery with NIP-68 integration
- **Events** (`/events`) - Live event calendar with NIP-53 scheduling

### **Music Pages** 
- **Wavlake Picks** (`/wavlake-picks`) - Peachy's curated music collection
- **Party View** (`/party-view`) - Full-screen music experience with zap codes
- **Weekly Leaderboard** (`/weekly-songs-leaderboard`) - Community-voted top tracks
- **Artist Pages** (`/artist/:id`) - Individual artist profiles with albums
- **Album Pages** (`/album/:id`) - Full album listings with track management
- **Track Pages** (`/wavlake/:id`) - Individual track details with voting
- **Explore Wavlake** (`/explore-wavlake`) - Browse Bitcoin music catalog

### **Interactive Features**
- **Audio Rooms** (`/audio-rooms`) - WebRTC voice chat with NIP-100
- **Live Chat** (`/chat`) - Global livestream messaging
- **Notifications** (`/notifications`) - Track suggestion management (Peachy only)
- **Edit Profile** (`/edit-profile`) - Profile management with NIP-05

### **Nostr Integration**
- **NIP-19 Routes** (`/npub1...`, `/note1...`, `/naddr1...`) - Direct Nostr content access

## 🎯 Use Cases

### Personal Websites
- **Content Creators** - Share blogs, music, and media on a decentralized platform
- **Musicians** - Showcase music with Bitcoin monetization
- **Podcasters** - Host live audio events with audience interaction

### Community Platforms
- **Bitcoin Communities** - Value-for-value content with Lightning integration
- **Open Source Projects** - Decentralized project communication and updates
- **Educational Content** - Share knowledge with built-in monetization

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following the existing code style
4. **Run tests** (`npm test`) to ensure everything works
5. **Commit changes** (`git commit -m 'Add amazing feature'`)
6. **Push to branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines
- **Follow TypeScript best practices** - Proper typing throughout
- **Write tests** for new functionality
- **Update documentation** for significant changes
- **Follow NIP standards** when implementing Nostr features

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **MKStack** - Original template and foundation
- **Nostr Community** - Protocol development and standards
- **Wavlake** - Music streaming platform integration  
- **shadcn/ui** - Beautiful component library
- **Nostrify** - Modern Nostr framework

## 🔧 Advanced Features

### **WebRTC Implementation**
The audio rooms implement chakany's NIP-100 WebRTC over Nostr specification:
- **NIP-100 Compliance** - Full implementation of the WebRTC over Nostr standard
- **Connection Management** - Automatic peer discovery and WebRTC signaling via Nostr
- **Real-time Subscriptions** - Instant event delivery via Nostrify streaming
- **Moderation System** - Extended kick/ban functionality with role-based permissions
- **Participant Tracking** - Heartbeat system with stale participant cleanup

### **Music Integration**
Comprehensive Bitcoin music ecosystem integration:
- **Wavlake API** - Full track, artist, and album data retrieval
- **Lightning Zaps** - QR code generation for artist support
- **Music Lists** - NIP-51 based playlist management
- **Voting System** - Kind 30003 community-driven track rankings
- **Track Discovery** - AI-powered music recommendations

### **Performance Optimizations**
- **Optimistic Updates** - Immediate UI feedback with background sync
- **Smart Caching** - React Query with strategic cache invalidation
- **Efficient Queries** - Combined Nostr filters to minimize relay load
- **Background Sync** - Non-blocking operations for better UX

## 📞 Support

- **Issues** - [GitHub Issues](https://github.com/patrickulrich/peachyhodl/issues)
- **Discussions** - [GitHub Discussions](https://github.com/patrickulrich/peachyhodl/discussions)
- **Nostr** - Follow [@peachy](https://primal.net/peachy) on Nostr
- **Lightning** - Support development with Bitcoin tips
- **Wavlake** - [Official Wavlake Platform](https://wavlake.com) for Bitcoin music

---

**Built with ❤️ on Nostr** | **Powered by Bitcoin** | **Vibed with [MKStack](https://soapbox.pub/mkstack)**