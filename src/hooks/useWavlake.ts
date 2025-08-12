import { useQuery } from '@tanstack/react-query';
import { wavlakeAPI } from '@/lib/wavlake';

export function useWavlakeSearch(term: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['wavlake-search', term],
    queryFn: async () => {
      return wavlakeAPI.searchContent(term);
    },
    enabled: enabled && term.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWavlakeRankings(params: {
  sort: 'sats';
  days?: number;
  startDate?: string;
  endDate?: string;
  genre?: string;
  limit?: number;
} = { sort: 'sats', days: 7, limit: 50 }) {
  return useQuery({
    queryKey: ['wavlake-rankings', params],
    queryFn: async () => {
      return wavlakeAPI.getRankings(params);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useWavlakeTrack(trackId: string | undefined) {
  return useQuery({
    queryKey: ['wavlake-track', trackId],
    queryFn: async () => {
      return wavlakeAPI.getTrack(trackId!);
    },
    enabled: !!trackId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useWavlakeArtist(artistId: string | undefined) {
  return useQuery({
    queryKey: ['wavlake-artist', artistId],
    queryFn: async () => {
      return wavlakeAPI.getArtist(artistId!);
    },
    enabled: !!artistId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useWavlakeAlbum(albumId: string | undefined) {
  return useQuery({
    queryKey: ['wavlake-album', albumId],
    queryFn: async () => {
      return wavlakeAPI.getAlbum(albumId!);
    },
    enabled: !!albumId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useWavlakePlaylist(playlistId: string | undefined) {
  return useQuery({
    queryKey: ['wavlake-playlist', playlistId],
    queryFn: async () => {
      return wavlakeAPI.getPlaylist(playlistId!);
    },
    enabled: !!playlistId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useWavlakeLnurl(contentId: string | undefined, appId: string = 'nostrmusic') {
  return useQuery({
    queryKey: ['wavlake-lnurl', contentId, appId],
    queryFn: async () => {
      return wavlakeAPI.getLnurl(contentId!, appId);
    },
    enabled: !!contentId,
    staleTime: 5 * 60 * 1000, // 5 minutes - shorter since LNURL can change
  });
}