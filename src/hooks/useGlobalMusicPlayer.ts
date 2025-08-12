import { useCallback } from 'react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import type { MusicTrack } from '@/hooks/useMusicLists';

export function useGlobalMusicPlayer() {
  const { playTrack, togglePlay, currentTrack, isPlaying, closePlayer } = useMusicPlayer();

  const playTrackWithPlaylist = useCallback((
    track: MusicTrack, 
    playlist: MusicTrack[] = [track], 
    index?: number
  ) => {
    const trackIndex = index !== undefined ? index : playlist.findIndex(t => t.id === track.id);
    playTrack(track, playlist, Math.max(0, trackIndex));
  }, [playTrack]);

  const playTracksFromList = useCallback((tracks: MusicTrack[], startIndex: number = 0) => {
    if (tracks.length === 0) return;
    const track = tracks[startIndex];
    playTrack(track, tracks, startIndex);
  }, [playTrack]);

  const isTrackPlaying = useCallback((trackId: string) => {
    return currentTrack?.id === trackId && isPlaying;
  }, [currentTrack?.id, isPlaying]);

  const isTrackCurrent = useCallback((trackId: string) => {
    return currentTrack?.id === trackId;
  }, [currentTrack?.id]);

  return {
    playTrack: playTrackWithPlaylist,
    playTracksFromList,
    togglePlay,
    closePlayer,
    isTrackPlaying,
    isTrackCurrent,
    currentTrack,
    isPlaying,
  };
}