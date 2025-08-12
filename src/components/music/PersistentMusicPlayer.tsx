import { useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { WavlakeZapDialog } from '@/components/music/WavlakeZapDialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { useIsMobile } from '@/hooks/useIsMobile';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Zap,
  Heart,
  X,
  Music
} from 'lucide-react';

export function PersistentMusicPlayer() {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    isMuted, 
    isLoading,
    isPlayerVisible,
    playlist,
    currentIndex,
    togglePlay, 
    nextTrack, 
    previousTrack, 
    setCurrentTime, 
    setDuration, 
    setVolume, 
    toggleMute, 
    setIsLoading,
    closePlayer 
  } = useMusicPlayer();

  const { user } = useCurrentUser();
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Audio event handlers
  const handleLoadStart = useCallback(() => {
    console.log('Audio loading started for:', currentTrack?.title);
    setIsLoading(true);
  }, [setIsLoading, currentTrack?.title]);

  const handleLoadedData = useCallback(() => {
    console.log('Audio loaded successfully for:', currentTrack?.title);
    setIsLoading(false);
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, [setDuration, setIsLoading, currentTrack?.title]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [setCurrentTime]);

  const handleCanPlay = useCallback(() => {
    console.log('Audio can start playing');
    // If we're supposed to be playing but aren't yet, start playing
    if (isPlaying && audioRef.current && audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      console.log('Auto-starting playback after canplay event');
      playPromise
        .then(() => {
          console.log('Auto-play started successfully');
        })
        .catch((error) => {
          console.error('Auto-play failed:', error);
          if (error.name !== 'AbortError') {
            setIsLoading(false);
            toast({
              title: "Playback Error",
              description: `Failed to load "${currentTrack?.title || 'the audio track'}". Please try again.`,
              variant: "destructive",
            });
          }
        });
    }
  }, [isPlaying, setIsLoading, toast, currentTrack?.title]);

  const handleEnded = useCallback(() => {
    // Auto-advance to next track if available
    if (playlist.length > 1) {
      nextTrack();
    }
  }, [nextTrack, playlist.length]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    console.error('Audio playback error - Current track:', currentTrack);
    
    // Only show toast for actual loading errors, not AbortErrors from quick clicking
    if (audioRef.current?.error) {
      const audioError = audioRef.current.error;
      // MediaError.MEDIA_ERR_ABORTED = 1
      if (audioError.code !== 1) {
        toast({
          title: "Playback Error",
          description: `Failed to load "${currentTrack?.title || 'the audio track'}". Please try again.`,
          variant: "destructive",
        });
      }
    }
  }, [setIsLoading, toast, currentTrack]);

  // Sync audio element with context state
  useEffect(() => {
    if (!audioRef.current) return;

    console.log('Sync audio state - isPlaying:', isPlaying, 'readyState:', audioRef.current.readyState);

    if (isPlaying) {
      // Only try to play if audio is ready or wait for it to be ready
      if (audioRef.current.readyState >= 3) { // HAVE_FUTURE_DATA or higher
        const playPromise = audioRef.current.play();
        console.log('Attempting to play audio...');
        playPromise
          .then(() => {
            console.log('Audio playback started successfully');
          })
          .catch((error) => {
            console.error('Play promise rejected:', error);
            // Only handle non-AbortError cases - inline error handling to avoid circular deps
            if (error.name !== 'AbortError') {
              setIsLoading(false);
              toast({
                title: "Playback Error",
                description: `Failed to load "${currentTrack?.title || 'the audio track'}". Please try again.`,
                variant: "destructive",
              });
            }
          });
      } else {
        console.log('Audio not ready yet, waiting for canplay event');
        // Audio will auto-play when ready due to onCanPlay handler below
      }
    } else {
      console.log('Pausing audio');
      audioRef.current.pause();
    }
  }, [isPlaying, setIsLoading, toast, currentTrack?.title]);

  // Update audio source when track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    // Get the media URL from either mediaUrl or urls array
    let mediaUrl = currentTrack.mediaUrl || currentTrack.urls?.[0]?.url;
    
    if (!mediaUrl) {
      console.error('No valid media URL found for track:', currentTrack);
      setIsLoading(false);
      toast({
        title: "Playback Error",
        description: `Failed to load "${currentTrack?.title || 'the audio track'}". Please try again.`,
        variant: "destructive",
      });
      return;
    }

    // If it's an op3.dev analytics URL, try to extract the direct CloudFront URL
    if (mediaUrl.includes('op3.dev/e,')) {
      const match = mediaUrl.match(/https:\/\/op3\.dev\/e,[^/]+\/(.+)/);
      if (match && match[1]) {
        const directUrl = decodeURIComponent(match[1]);
        console.log('Extracted direct URL from op3.dev:', directUrl);
        mediaUrl = directUrl;
      }
    }

    console.log('Setting audio source to:', mediaUrl);
    audioRef.current.src = mediaUrl;
    audioRef.current.load();
    
    // Log the audio element's ready state
    setTimeout(() => {
      if (audioRef.current) {
        console.log('Audio ready state:', audioRef.current.readyState, 'Network state:', audioRef.current.networkState);
      }
    }, 100);
  }, [currentTrack, setIsLoading, toast]);

  // Update volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleSeek = useCallback((value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  }, [setCurrentTime]);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
  }, [setVolume]);

  const handleVoteTrack = useCallback(() => {
    if (!user || !currentTrack) {
      toast({
        title: "Login Required",
        description: "Please log in to vote for tracks.",
        variant: "destructive",
      });
      return;
    }

    // Create a kind 30003 bookmark set for voting
    createEvent({
      kind: 30003,
      content: '',
      tags: [
        ['d', 'peachy-song-vote'],
        ['title', 'Peachy Song Vote'],
        ['a', `32123:${currentTrack.pubkey}:${currentTrack.id}`],
        ['e', currentTrack.id],
        ['r', `https://wavlake.com/track/${currentTrack.id}`],
        ['track_title', currentTrack.title],
        ['track_artist', currentTrack.artist],
        ['track_id', currentTrack.id]
      ]
    });

    toast({
      title: "Vote Submitted!",
      description: `Voted for "${currentTrack.title}" by ${currentTrack.artist}`,
    });
  }, [user, currentTrack, createEvent, toast]);

  // Hide player on radio and party view pages
  const isFullscreenPage = location.pathname === '/radio' || location.pathname === '/party-view';
  
  // Don't render if on fullscreen pages or if player is not visible
  if (isFullscreenPage || !isPlayerVisible || !currentTrack) {
    return null;
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasNavigation = playlist.length > 1;

  // Mobile layout (twice the height with different structure)
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <Card className="rounded-none border-0 shadow-lg">
          <CardContent className="p-3">
            {/* Mobile: Top section with artwork, track info, and action buttons */}
            <div className="flex items-center gap-3 mb-3">
              {/* Large Artwork */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {currentTrack.image ? (
                  <img
                    src={currentTrack.image}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Track Info */}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">{currentTrack.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                {hasNavigation && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {currentIndex + 1} of {playlist.length}
                  </p>
                )}
              </div>

              {/* Action Buttons: Heart, Zap, X */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoteTrack}
                  className="h-9 w-9 p-0"
                  title="Vote for this track"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                
                <WavlakeZapDialog track={currentTrack}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    title="Zap artist"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </WavlakeZapDialog>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closePlayer}
                  className="h-9 w-9 p-0"
                  title="Close player"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile: Bottom section with controls, scrubber, and volume */}
            <div className="space-y-2">
              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-8 text-right flex-shrink-0">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-1 min-w-0"
                />
                <span className="text-xs text-muted-foreground w-8 flex-shrink-0">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controls and Volume */}
              <div className="flex items-center justify-between">
                {/* Playback Controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {hasNavigation && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={previousTrack}
                      className="h-9 w-9 p-0"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="h-11 w-11 p-0"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    ) : isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  
                  {hasNavigation && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextTrack}
                      className="h-9 w-9 p-0"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="h-7 w-7 p-0"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-3 w-3" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-16"
                  />
                </div>
              </div>
            </div>

            {/* Hidden Audio Element */}
            <audio
              ref={audioRef}
              onLoadStart={handleLoadStart}
              onLoadedData={handleLoadedData}
              onLoadedMetadata={() => console.log('Audio metadata loaded')}
              onCanPlay={handleCanPlay}
              onCanPlayThrough={() => console.log('Audio can play through without buffering')}
              onPlay={() => console.log('Audio play event fired')}
              onPlaying={() => console.log('Audio is now playing')}
              onPause={() => console.log('Audio paused')}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onError={handleError}
              onStalled={() => console.log('Audio stalled')}
              onSuspend={() => console.log('Audio suspended')}
              onWaiting={() => console.log('Audio waiting for data')}
              onAbort={() => console.log('Audio loading aborted')}
              preload="metadata"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop layout (original single-row layout)
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <Card className="rounded-none border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {currentTrack.image ? (
                  <img
                    src={currentTrack.image}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">{currentTrack.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                {hasNavigation && (
                  <p className="text-xs text-muted-foreground">
                    {currentIndex + 1} of {playlist.length}
                  </p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {hasNavigation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={previousTrack}
                  className="h-8 w-8 p-0"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              {hasNavigation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextTrack}
                  className="h-8 w-8 p-0"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>

            {/* Action Buttons: Heart, Zap, X */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoteTrack}
                className="h-8 w-8 p-0"
                title="Vote for this track"
              >
                <Heart className="h-4 w-4" />
              </Button>
              
              <WavlakeZapDialog track={currentTrack}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Zap artist"
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </WavlakeZapDialog>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={closePlayer}
                className="h-8 w-8 p-0"
                title="Close player"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            onLoadStart={handleLoadStart}
            onLoadedData={handleLoadedData}
            onLoadedMetadata={() => console.log('Audio metadata loaded')}
            onCanPlay={handleCanPlay}
            onCanPlayThrough={() => console.log('Audio can play through without buffering')}
            onPlay={() => console.log('Audio play event fired')}
            onPlaying={() => console.log('Audio is now playing')}
            onPause={() => console.log('Audio paused')}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={handleError}
            onStalled={() => console.log('Audio stalled')}
            onSuspend={() => console.log('Audio suspended')}
            onWaiting={() => console.log('Audio waiting for data')}
            onAbort={() => console.log('Audio loading aborted')}
            preload="metadata"
          />
        </CardContent>
      </Card>
    </div>
  );
}