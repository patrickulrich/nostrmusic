import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export interface TrackInfo {
  title: string;
  artist?: string;
  duration?: number; // duration in seconds
  url?: string; // URL to the track (e.g., Wavlake URL)
}

export function useMusicStatus() {
  const { mutateAsync: createEvent } = useNostrPublish();
  const { settings } = useAppSettings();
  const { user } = useCurrentUser();

  const publishMusicStatus = async (track: TrackInfo | null) => {
    // Only publish if the feature is enabled and user is logged in
    if (!settings.publishListeningStatus || !user) {
      return;
    }

    if (track === null) {
      // Clear the music status when playback stops
      try {
        await createEvent({
          kind: 30315,
          content: '',
          tags: [
            ['d', 'music'],
          ]
        });
      } catch (error) {
        console.error('Failed to clear music status:', error);
      }
      return;
    }

    // Format content with track info
    let content = track.title;
    if (track.artist) {
      content = `${track.title} - ${track.artist}`;
    }

    // Prepare tags
    const tags: string[][] = [
      ['d', 'music']
    ];

    // Add URL tag pointing to the specific track on our site
    if (track.url) {
      tags.push(['r', track.url]);
    }

    // Add expiration tag if duration is known
    // The expiration should be when the track will stop playing
    if (track.duration && track.duration > 0) {
      const expirationTime = Math.floor(Date.now() / 1000) + track.duration;
      tags.push(['expiration', expirationTime.toString()]);
    }

    // Add alt tag for NIP-31 compatibility
    tags.push(['alt', `Listening to Wavlake on NostrMusic.com: ${content}`]);

    try {
      await createEvent({
        kind: 30315,
        content,
        tags
      });
    } catch (error) {
      console.error('Failed to publish music status:', error);
    }
  };

  const clearMusicStatus = () => publishMusicStatus(null);

  return {
    publishMusicStatus,
    clearMusicStatus,
    isEnabled: settings.publishListeningStatus && !!user
  };
}