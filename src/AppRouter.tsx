import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { PersistentMusicPlayer } from "./components/music/PersistentMusicPlayer";

import Index from "./pages/Index";
import WavlakeArtist from "./pages/WavlakeArtist";
import WavlakeAlbum from "./pages/WavlakeAlbum";
import WavlakeTrack from "./pages/WavlakeTrack";
import WavlakeRadio from "./pages/WavlakeRadio";
import Leaderboard from "./pages/Leaderboard";
import PartyView from "./pages/PartyView";
import { NotificationsPage } from "./pages/NotificationsPage";
import { EditProfile } from "./pages/EditProfile";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  // Get base path from environment, remove trailing slash if present
  const basename = import.meta.env.VITE_BASE_PATH?.replace(/\/$/, '') || "";
  
  return (
    <BrowserRouter 
      basename={basename}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/radio" element={<WavlakeRadio />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/party-view" element={<PartyView />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/artist/:artistId" element={<WavlakeArtist />} />
        <Route path="/album/:albumId" element={<WavlakeAlbum />} />
        <Route path="/wavlake/:trackId" element={<WavlakeTrack />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PersistentMusicPlayer />
    </BrowserRouter>
  );
}
export default AppRouter;