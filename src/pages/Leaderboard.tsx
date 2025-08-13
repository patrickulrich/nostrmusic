import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { VotersModal } from '@/components/VotersModal';
import { useToast } from '@/hooks/useToast';
import { Trophy, Heart, Play, Music, Zap } from 'lucide-react';
import { useGlobalMusicPlayer } from '@/hooks/useGlobalMusicPlayer';
import type { MusicTrack } from '@/hooks/useMusicLists';
import type { NostrEvent } from '@nostrify/nostrify';
import { WavlakeZapDialog } from '@/components/music/WavlakeZapDialog';

interface VoteData {
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  wavlakeUrl: string;
  votes: number;
  voters: string[];
}

export default function WeeklySongsLeaderboard() {
  useSeoMeta({
    title: 'Weekly Songs Leaderboard - Top 10 Voted Tracks',
    description: 'See the top 10 most voted songs of the week from the community.',
  });

  const { playTrack, currentTrack, isPlaying } = useGlobalMusicPlayer();
  const [votersModalData, setVotersModalData] = useState<{
    open: boolean;
    trackTitle: string;
    trackArtist: string;
    voters: string[];
  }>({
    open: false,
    trackTitle: '',
    trackArtist: '',
    voters: [],
  });

  const { nostr } = useNostr();
  const { toast } = useToast();
  

  // Query all voting events
  const { data: voteEvents = [], isLoading: isVotesLoading } = useQuery({
    queryKey: ['weekly-song-votes'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      
      // Get all Kind 30003 events with d="peachy-song-vote"
      const events = await nostr.query([{
        kinds: [30003],
        '#d': ['peachy-song-vote'],
        limit: 1000
      }], { signal });
      
      return events;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Process vote events into leaderboard data
  const leaderboardData = useMemo(() => {
    const voteMap = new Map<string, VoteData>();
    
    voteEvents.forEach((event: NostrEvent) => {
      const trackIdTag = event.tags.find(tag => tag[0] === 'track_id');
      const trackTitleTag = event.tags.find(tag => tag[0] === 'track_title');
      const trackArtistTag = event.tags.find(tag => tag[0] === 'track_artist');
      const urlTag = event.tags.find(tag => tag[0] === 'r');
      
      if (!trackIdTag?.[1] || !trackTitleTag?.[1] || !trackArtistTag?.[1] || !urlTag?.[1]) {
        return; // Skip invalid votes
      }
      
      const trackId = trackIdTag[1];
      const trackTitle = trackTitleTag[1];
      const trackArtist = trackArtistTag[1];
      const wavlakeUrl = urlTag[1];
      
      if (voteMap.has(trackId)) {
        const existing = voteMap.get(trackId)!;
        if (!existing.voters.includes(event.pubkey)) {
          existing.votes += 1;
          existing.voters.push(event.pubkey);
        }
      } else {
        voteMap.set(trackId, {
          trackId,
          trackTitle,
          trackArtist,
          wavlakeUrl,
          votes: 1,
          voters: [event.pubkey]
        });
      }
    });
    
    return Array.from(voteMap.values())
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10); // Top 10
  }, [voteEvents]);

  // Pre-fetch track data for all leaderboard items for faster playback and adding to picks
  const { data: musicTracks = new Map<string, MusicTrack>(), isLoading: isTracksLoading } = useQuery({
    queryKey: ['leaderboard-tracks', leaderboardData.map(v => v.trackId).join(',')],
    queryFn: async () => {
      if (leaderboardData.length === 0) return new Map<string, MusicTrack>();
      
      const { wavlakeAPI } = await import('@/lib/wavlake');
      const trackMap = new Map<string, MusicTrack>();
      
      // Fetch all tracks in parallel for better performance
      const trackPromises = leaderboardData.map(async (voteData) => {
        try {
          const track = await wavlakeAPI.getTrack(voteData.trackId);
          const musicTrack: MusicTrack = {
            id: track.id,
            title: track.title,
            artist: track.artist,
            album: track.albumTitle,
            duration: track.duration,
            image: track.albumArtUrl || track.artistArtUrl,
            mediaUrl: track.mediaUrl,
            albumArtUrl: track.albumArtUrl,
            artistArtUrl: track.artistArtUrl,
            artistId: track.artistId,
            albumId: track.albumId,
            artistNpub: track.artistNpub,
            msatTotal: track.msatTotal,
            releaseDate: track.releaseDate,
            description: `Track from ${track.artist} • Album: ${track.albumTitle}`,
            publishedAt: new Date(track.releaseDate).getTime() / 1000,
            urls: [{
              url: track.mediaUrl,
              mimeType: 'audio/mpeg',
              quality: 'stream'
            }],
            createdAt: Math.floor(Date.now() / 1000),
            pubkey: track.artistNpub,
          };
          trackMap.set(voteData.trackId, musicTrack);
        } catch (error) {
          console.error(`Failed to fetch track ${voteData.trackId}:`, error);
        }
      });
      
      await Promise.allSettled(trackPromises);
      return trackMap;
    },
    enabled: leaderboardData.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Convert vote data to MusicTrack for player (now instant from cache)
  const convertVoteToMusicTrack = useCallback(async (voteData: VoteData): Promise<MusicTrack | null> => {
    // First check if we have it in our pre-fetched cache
    const cachedTrack = musicTracks.get(voteData.trackId);
    if (cachedTrack) {
      return cachedTrack;
    }
    
    // Fallback to API call if not in cache (shouldn't happen normally)
    try {
      const { wavlakeAPI } = await import('@/lib/wavlake');
      const track = await wavlakeAPI.getTrack(voteData.trackId);
      
      return {
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.albumTitle,
        duration: track.duration,
        image: track.albumArtUrl || track.artistArtUrl,
        mediaUrl: track.mediaUrl,
        albumArtUrl: track.albumArtUrl,
        artistArtUrl: track.artistArtUrl,
        artistId: track.artistId,
        albumId: track.albumId,
        artistNpub: track.artistNpub,
        msatTotal: track.msatTotal,
        releaseDate: track.releaseDate,
        description: `Track from ${track.artist} • Album: ${track.albumTitle}`,
        publishedAt: new Date(track.releaseDate).getTime() / 1000,
        urls: [{
          url: track.mediaUrl,
          mimeType: 'audio/mpeg',
          quality: 'stream'
        }],
        createdAt: Math.floor(Date.now() / 1000),
        pubkey: track.artistNpub,
      };
    } catch (error) {
      console.error('Failed to convert vote to music track:', error);
      return null;
    }
  }, [musicTracks]);

  // Play track function
  const handlePlayTrack = useCallback(async (voteData: VoteData) => {
    const musicTrack = await convertVoteToMusicTrack(voteData);
    if (musicTrack) {
      playTrack(musicTrack, [musicTrack]);
    } else {
      toast({
        title: 'Failed to Play Track',
        description: 'Could not load track details.',
        variant: 'destructive',
      });
    }
  }, [convertVoteToMusicTrack, toast, playTrack]);



  // Remove Peachy-only restriction - page is now visible to everyone
  // Combined loading state for both votes and track data
  const isLoading = isVotesLoading || isTracksLoading;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Trophy className="h-10 w-10 text-primary" />
            Weekly Songs Leaderboard
          </h1>
          <p className="text-lg text-muted-foreground">
            The top 10 most voted songs of the week from our community.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Top 10 Voted Songs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-14 h-14 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : leaderboardData.length > 0 ? (
                leaderboardData.map((vote, index) => {
                  const isCurrentTrack = currentTrack?.id === vote.trackId;
                  const trackIsPlaying = isCurrentTrack && isPlaying;
                  
                  return (
                    <Card key={vote.trackId} className={`group hover:shadow-md transition-all duration-200 ${
                      isCurrentTrack ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            {/* Ranking */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-500 text-yellow-900' :
                              index === 1 ? 'bg-gray-400 text-gray-900' :
                              index === 2 ? 'bg-amber-600 text-amber-100' :
                              'bg-primary/10 text-primary'
                            }`}>
                              {index + 1}
                            </div>
                            
                            {/* Album art */}
                            <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center overflow-hidden relative group flex-shrink-0">
                              {musicTracks.get(vote.trackId)?.albumArtUrl || musicTracks.get(vote.trackId)?.image ? (
                                <img
                                  src={musicTracks.get(vote.trackId)?.albumArtUrl || musicTracks.get(vote.trackId)?.image}
                                  alt={vote.trackTitle}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Music className="h-7 w-7 text-muted-foreground" />
                              )}
                              
                              {/* Play overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  size="sm"
                                  className="rounded-full h-8 w-8 p-0"
                                  onClick={() => handlePlayTrack(vote)}
                                >
                                  {trackIsPlaying ? (
                                    <div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Play className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 ml-11 sm:ml-0">
                            <h3 className={`font-medium line-clamp-1 ${isCurrentTrack ? 'text-primary' : ''}`}>
                              <Link 
                                to={`/wavlake/${vote.trackId}`}
                                className="hover:underline hover:text-primary transition-colors"
                              >
                                {vote.trackTitle}
                              </Link>
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {musicTracks.get(vote.trackId)?.artistId ? (
                                <Link 
                                  to={`/artist/${musicTracks.get(vote.trackId)?.artistId}`}
                                  className="hover:underline hover:text-foreground transition-colors"
                                >
                                  {vote.trackArtist}
                                </Link>
                              ) : (
                                vote.trackArtist
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs flex items-center gap-1 cursor-pointer hover:bg-muted transition-colors"
                                onClick={() => {
                                  setVotersModalData({
                                    open: true,
                                    trackTitle: vote.trackTitle,
                                    trackArtist: vote.trackArtist,
                                    voters: vote.voters,
                                  });
                                }}
                              >
                                <Heart className="h-3 w-3 text-red-500" />
                                {vote.votes} vote{vote.votes !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="hidden sm:flex items-center gap-2 sm:ml-auto">
                            <Button
                              size="sm"
                              variant={trackIsPlaying ? "default" : "outline"}
                              onClick={() => handlePlayTrack(vote)}
                            >
                              {trackIsPlaying ? (
                                <div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin mr-2" />
                              ) : (
                                <Play className="h-3 w-3 mr-2" />
                              )}
                              {trackIsPlaying ? 'Playing' : 'Play'}
                            </Button>
                            
                            {musicTracks.get(vote.trackId) && (
                              <WavlakeZapDialog 
                                track={musicTracks.get(vote.trackId)!}
                                className="inline-flex"
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                >
                                  <Zap className="h-3 w-3 mr-1" />
                                  Zap
                                </Button>
                              </WavlakeZapDialog>
                            )}
                          </div>
                        </div>
                        
                        {/* Mobile buttons */}
                        <div className="flex sm:hidden flex-wrap items-center gap-2 mt-3 ml-11">
                          <Button
                            size="sm"
                            variant={trackIsPlaying ? "default" : "outline"}
                            onClick={() => handlePlayTrack(vote)}
                          >
                            {trackIsPlaying ? (
                              <div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                              <Play className="h-3 w-3 mr-2" />
                            )}
                            {trackIsPlaying ? 'Playing' : 'Play'}
                          </Button>
                          
                          {musicTracks.get(vote.trackId) && (
                            <WavlakeZapDialog 
                              track={musicTracks.get(vote.trackId)!}
                              className="inline-flex"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Zap
                              </Button>
                            </WavlakeZapDialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Votes Yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to vote for your favorite songs! Check out the Explore section to start voting.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Voters Modal */}
        <VotersModal
          open={votersModalData.open}
          onOpenChange={(open) => setVotersModalData(prev => ({ ...prev, open }))}
          trackTitle={votersModalData.trackTitle}
          trackArtist={votersModalData.trackArtist}
          voters={votersModalData.voters}
        />
      </div>
    </MainLayout>
  );
}