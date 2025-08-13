import { useQuery, useMutation } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface AppSettings {
  publishListeningStatus: boolean;
  // Add more settings as needed
}


const APP_IDENTIFIER = 'nostrmusic-settings';

export function useAppSettings() {
  const { nostr } = useNostr();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { user } = useCurrentUser();
  
  // Local storage fallback for when not logged in
  const [localPublishListeningStatus, setLocalPublishListeningStatus] = useLocalStorage('publishListeningStatus', false);

  // Fetch settings from Nostr (NIP-78)
  const { data: remoteSettings, refetch } = useQuery({
    queryKey: ['app-settings', user?.pubkey],
    queryFn: async () => {
      if (!user) return null;
      
      const signal = AbortSignal.timeout(1500);
      const events = await nostr.query([
        {
          kinds: [30078],
          authors: [user.pubkey],
          '#d': [APP_IDENTIFIER],
          limit: 1
        }
      ], { signal });

      if (events.length === 0) return null;

      try {
        const settings = JSON.parse(events[0].content) as AppSettings;
        return settings;
      } catch (error) {
        console.error('Failed to parse settings from Nostr:', error);
        return null;
      }
    },
    enabled: !!user,
    staleTime: 60000, // Consider data fresh for 1 minute
  });

  // Get effective settings (remote if available, otherwise local/default)
  const settings: AppSettings = user && remoteSettings 
    ? remoteSettings 
    : {
        publishListeningStatus: localPublishListeningStatus,
      };

  // Save settings to Nostr (NIP-78)
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: AppSettings) => {
      if (!user) {
        // Save to localStorage when not logged in
        setLocalPublishListeningStatus(newSettings.publishListeningStatus);
        return;
      }

      // Save to Nostr using NIP-78
      await publishEvent({
        kind: 30078,
        content: JSON.stringify(newSettings),
        tags: [
          ['d', APP_IDENTIFIER],
          ['title', 'NostrMusic Settings'],
          ['description', 'Personal settings for NostrMusic app'],
        ]
      });
    },
    onSuccess: () => {
      if (user) {
        // Refetch to get the latest data
        refetch();
      }
    }
  });

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    saveSettingsMutation.mutate(updatedSettings);
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    updateSettings({ [key]: value });
  };

  return {
    settings,
    updateSettings,
    updateSetting,
    isLoading: saveSettingsMutation.isPending,
    error: saveSettingsMutation.error,
    isRemoteEnabled: !!user && !!remoteSettings,
  };
}