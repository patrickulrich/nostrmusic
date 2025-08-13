import { useParams } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, MapPin, Zap, Clock } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useIsFollowing, useFollowUser } from '@/hooks/useFollows';
import { useGlobalMusicPlayer } from '@/hooks/useGlobalMusicPlayer';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { SendMessageDialog } from '@/components/SendMessageDialog';
import NotFound from './NotFound';
import { MainLayout } from '@/components/layout/MainLayout';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Play, Pause, Music2 } from 'lucide-react';
import type { MusicTrack } from '@/hooks/useMusicLists';

interface ProfileCustomization {
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
  linkColor?: string;
  profileSong?: string;
}

export function ProfilePage() {
  // Can be called with either 'pubkey' or 'nip19' param
  const { pubkey: pubkeyParam, nip19: nip19Param } = useParams<{ pubkey?: string; nip19?: string }>();
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  
  const paramValue = pubkeyParam || nip19Param;
  
  // Decode the pubkey if it's a NIP-19 identifier
  let pubkey: string = '';
  let isValidPubkey = false;
  
  if (paramValue) {
    if (paramValue.startsWith('npub1') || paramValue.startsWith('nprofile1')) {
      try {
        const decoded = nip19.decode(paramValue);
        if (decoded.type === 'npub') {
          pubkey = decoded.data;
          isValidPubkey = true;
        } else if (decoded.type === 'nprofile') {
          pubkey = decoded.data.pubkey;
          isValidPubkey = true;
        }
      } catch {
        // Invalid NIP-19 identifier
      }
    } else {
      pubkey = paramValue;
      isValidPubkey = true;
    }
  }
  
  // Call all hooks before conditional returns
  const author = useAuthor(pubkey || 'invalid');
  const metadata: NostrMetadata | undefined = author.data?.metadata;
  const isFollowing = useIsFollowing(pubkey || 'invalid');
  const { mutate: toggleFollow } = useFollowUser();
  
  // Parse custom fields from metadata for MySpace-style customization
  const customization: ProfileCustomization = {};
  if (metadata) {
    // Look for custom fields in the metadata
    const metadataAny = metadata as Record<string, unknown>;
    if (typeof metadataAny.myspace_bg_color === 'string') customization.backgroundColor = metadataAny.myspace_bg_color;
    if (typeof metadataAny.myspace_bg_image === 'string') customization.backgroundImage = metadataAny.myspace_bg_image;
    if (typeof metadataAny.myspace_text_color === 'string') customization.textColor = metadataAny.myspace_text_color;
    if (typeof metadataAny.myspace_link_color === 'string') customization.linkColor = metadataAny.myspace_link_color;
    if (typeof metadataAny.myspace_profile_song === 'string') customization.profileSong = metadataAny.myspace_profile_song;
  }

  // Fetch user's last activity
  const { data: lastActivity } = useQuery({
    queryKey: ['user-last-activity', pubkey],
    enabled: isValidPubkey,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query(
        [{ authors: [pubkey], limit: 1 }],
        { signal }
      );
      return events[0]?.created_at || null;
    },
  });

  // Fetch user's status (NIP-38) with frequent updates
  const { data: userStatus } = useQuery({
    queryKey: ['user-status', pubkey],
    enabled: isValidPubkey,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query(
        [{ 
          kinds: [30315], 
          authors: [pubkey],
          limit: 10 // Get multiple status types
        }],
        { signal }
      );
      
      if (!events || events.length === 0) return null;
      
      // Group by status type (d tag) and get the most recent for each
      const statusByType: Record<string, NostrEvent> = {};
      events.forEach(event => {
        const dTag = event.tags.find(tag => tag[0] === 'd')?.[1];
        if (dTag && (!statusByType[dTag] || event.created_at > statusByType[dTag].created_at)) {
          // Check if status is expired
          const expirationTag = event.tags.find(tag => tag[0] === 'expiration')?.[1];
          const isExpired = expirationTag && parseInt(expirationTag) < Math.floor(Date.now() / 1000);
          if (!isExpired) {
            statusByType[dTag] = event;
          }
        }
      });
      
      return statusByType;
    },
    // Shorter stale time and frequent refetch for status updates
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch user's voted tracks (favorite songs)
  const { data: votedTracks } = useQuery({
    queryKey: ['user-voted-tracks', pubkey],
    enabled: isValidPubkey,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query(
        [{ 
          kinds: [30003], 
          authors: [pubkey],
          '#d': ['peachy-song-vote'],
          limit: 1
        }],
        { signal }
      );
      
      if (!events || events.length === 0) return null;
      
      // Get the most recent vote event
      const voteEvent = events.sort((a, b) => b.created_at - a.created_at)[0];
      
      // Extract track info from tags
      const trackIdTag = voteEvent.tags.find(tag => tag[0] === 'track_id');
      const trackTitleTag = voteEvent.tags.find(tag => tag[0] === 'track_title');
      const trackArtistTag = voteEvent.tags.find(tag => tag[0] === 'track_artist');
      const urlTag = voteEvent.tags.find(tag => tag[0] === 'r');
      
      if (trackIdTag?.[1]) {
        // Try to fetch the actual track data from Wavlake
        try {
          const { wavlakeAPI } = await import('@/lib/wavlake');
          const track = await wavlakeAPI.getTrack(trackIdTag[1]);
          
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
            createdAt: Date.now()
          } as MusicTrack;
        } catch {
          // If Wavlake fetch fails, use data from tags
          if (trackTitleTag && trackArtistTag) {
            return {
              id: trackIdTag[1],
              title: trackTitleTag[1],
              artist: trackArtistTag[1],
              albumArtUrl: '',
              mediaUrl: urlTag?.[1] || '',
              createdAt: Date.now()
            } as MusicTrack;
          }
        }
      }
      return null;
    },
  });

  // Fetch user's interests (NIP-51)
  const { data: userInterests } = useQuery({
    queryKey: ['user-interests', pubkey],
    enabled: isValidPubkey,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query(
        [{ 
          kinds: [10015, 30015], // Standard interests list and interest sets
          authors: [pubkey],
          limit: 20
        }],
        { signal }
      );
      
      if (!events || events.length === 0) return null;
      
      const interests = new Set<string>();
      events.forEach(event => {
        event.tags.forEach(([tagName, value]) => {
          if (tagName === 't' && value) {
            interests.add(value);
          }
        });
      });
      
      return Array.from(interests);
    },
  });

  // Fetch user's heroes/follow sets (NIP-51)
  const { data: heroSets } = useQuery({
    queryKey: ['user-hero-sets', pubkey],
    enabled: isValidPubkey,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query(
        [{ 
          kinds: [30000], // Follow sets
          authors: [pubkey],
          limit: 20
        }],
        { signal }
      );
      
      if (!events || events.length === 0) return null;
      
      // Look for sets that could be heroes (heroes, influences, inspirations, etc.)
      const heroKeywords = ['hero', 'influence', 'inspiration', 'mentor', 'idol'];
      const heroSets = events.filter(event => {
        const dTag = event.tags.find(tag => tag[0] === 'd')?.[1]?.toLowerCase() || '';
        const title = event.tags.find(tag => tag[0] === 'title')?.[1]?.toLowerCase() || '';
        return heroKeywords.some(keyword => dTag.includes(keyword) || title.includes(keyword));
      });
      
      if (heroSets.length === 0) return null;
      
      // Get pubkeys from the first hero set
      const heroSet = heroSets[0];
      const heroPubkeys = heroSet.tags
        .filter(([tag]) => tag === 'p')
        .map(([_, pubkey]) => pubkey)
        .slice(0, 5); // Limit to 5 heroes
      
      return heroPubkeys;
    },
  });

  // Fetch user's follows (for Top 8)
  const { data: followList } = useQuery({
    queryKey: ['user-follows', pubkey],
    enabled: isValidPubkey,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query(
        [{ kinds: [3], authors: [pubkey], limit: 1 }],
        { signal }
      );
      
      const followListEvent = events.sort((a, b) => b.created_at - a.created_at)[0];
      if (!followListEvent) return [];
      
      // Extract first 8 follows (Top 8)
      const follows = followListEvent.tags
        .filter(([tag]) => tag === 'p')
        .slice(0, 8)
        .map(([_, pubkey]) => pubkey);
      
      return follows;
    },
  });

  // Fetch user's recent posts
  const { data: recentPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', pubkey],
    enabled: isValidPubkey,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query(
        [{ kinds: [1], authors: [pubkey], limit: 10 }],
        { signal }
      );
      return events.sort((a, b) => b.created_at - a.created_at);
    },
  });

  // Fetch suggested people based on shared interests
  const { data: suggestedPeople } = useQuery({
    queryKey: ['suggested-people', pubkey, userInterests],
    enabled: isValidPubkey && !!userInterests && userInterests.length > 0,
    queryFn: async (c) => {
      if (!userInterests || userInterests.length === 0) return null;
      
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      // Find people who share interests
      const events = await nostr.query(
        [{ 
          kinds: [10015, 30015],
          '#t': userInterests.slice(0, 5), // Use first 5 interests to avoid too broad search
          limit: 100
        }],
        { signal }
      );
      
      if (!events || events.length === 0) return null;
      
      // Score people by number of shared interests
      const peopleScores: Record<string, number> = {};
      events.forEach(event => {
        if (event.pubkey === pubkey) return; // Skip own profile
        
        const sharedInterests = event.tags
          .filter(([tag, value]) => tag === 't' && userInterests.includes(value))
          .length;
        
        if (sharedInterests > 0) {
          peopleScores[event.pubkey] = (peopleScores[event.pubkey] || 0) + sharedInterests;
        }
      });
      
      // Get top 6 people with most shared interests
      const topPeople = Object.entries(peopleScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([pubkey]) => pubkey);
      
      return topPeople;
    },
  });

  // Fetch comprehensive stats
  const { data: stats } = useQuery({
    queryKey: ['profile-stats', pubkey],
    enabled: isValidPubkey,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      // Query multiple things in parallel for better performance
      const [followerEvents, userPosts, userFollows] = await Promise.all([
        // Get followers (people who follow this user)
        nostr.query([{ kinds: [3], '#p': [pubkey], limit: 1000 }], { signal }),
        // Get user's posts (kind 1 notes)
        nostr.query([{ kinds: [1], authors: [pubkey], limit: 1000 }], { signal }),
        // Get user's follow list
        nostr.query([{ kinds: [3], authors: [pubkey], limit: 1 }], { signal })
      ]);
      
      // Deduplicate followers by author pubkey
      const uniqueFollowers = new Set(followerEvents.map(e => e.pubkey));
      
      // Get following count from most recent follow list
      const mostRecentFollowList = userFollows.sort((a, b) => b.created_at - a.created_at)[0];
      const followingCount = mostRecentFollowList 
        ? mostRecentFollowList.tags.filter(([tag]) => tag === 'p').length 
        : 0;
      
      return {
        followers: uniqueFollowers.size,
        following: followingCount,
        posts: userPosts.length,
      };
    },
  });
  
  // Return early if no valid pubkey
  if (!isValidPubkey || !pubkey) {
    return <NotFound />;
  }

  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);
  const isOwnProfile = user?.pubkey === pubkey;
  const userLocation = (metadata as Record<string, unknown>)?.location;
  const locationString = typeof userLocation === 'string' ? userLocation : null;

  // Custom styles only if user has set them
  const pageStyle: React.CSSProperties = {
    backgroundColor: customization.backgroundColor,
    backgroundImage: customization.backgroundImage ? `url(${customization.backgroundImage})` : undefined,
    backgroundSize: customization.backgroundImage ? 'cover' : undefined,
    backgroundPosition: customization.backgroundImage ? 'center' : undefined,
    backgroundAttachment: customization.backgroundImage ? 'fixed' : undefined,
    color: customization.textColor,
    minHeight: '100vh',
  };

  if (author.isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div style={pageStyle} className="myspace-profile min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="max-w-6xl mx-auto p-4 space-y-4">
          {/* Profile Header */}
          <div className="bg-card/90 backdrop-blur rounded-lg p-6 border">
          <h1 className="text-3xl font-bold mb-2">{displayName}'s Profile</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">
              View My: <Link to={`/${nip19.npubEncode(pubkey)}/pics`} className="text-primary hover:underline">Pics</Link> | <Link to={`/${nip19.npubEncode(pubkey)}/videos`} className="text-primary hover:underline">Videos</Link>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Picture & Basic Info */}
            <Card className="bg-card/90 backdrop-blur border-2 border-primary">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Avatar className="w-48 h-48 mx-auto border-4 border-primary">
                    <AvatarImage src={metadata?.picture} alt={displayName} />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h2 className="text-2xl font-bold">{displayName}</h2>
                    {metadata?.nip05 && (
                      <p className="text-sm text-muted-foreground">✓ {metadata.nip05}</p>
                    )}
                  </div>

                  <div className="text-foreground text-sm space-y-1">
                    <p className="font-semibold">"Life is better with music"</p>
                    {locationString && (
                      <p className="flex items-center justify-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {locationString}
                      </p>
                    )}
                    {lastActivity && (
                      <p className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        Last seen: {formatDistanceToNow(new Date(lastActivity * 1000), { addSuffix: true })}
                      </p>
                    )}
                  </div>

                  {/* Mood Status - NIP-38 */}
                  {userStatus && Object.keys(userStatus).length > 0 && (
                    <div className="bg-muted p-2 rounded border">
                      {userStatus.general && (
                        <p className="text-sm font-bold">
                          Status: {userStatus.general.content || '🎵 Vibing'}
                        </p>
                      )}
                      {userStatus.music && (
                        <p className="text-sm font-bold mt-1">
                          🎵 Listening: {userStatus.music.content}
                        </p>
                      )}
                      {!userStatus.general && !userStatus.music && Object.values(userStatus)[0] && (
                        <p className="text-sm font-bold">
                          Status: {(Object.values(userStatus)[0] as NostrEvent).content || '🎵 Vibing'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {!isOwnProfile && (
                      <>
                        <Button 
                          onClick={() => toggleFollow({ pubkey })}
                          className="w-full"
                        >
                          {isFollowing ? '✓ Following' : '+ Add Friend'}
                        </Button>
                        <SendMessageDialog 
                          recipientPubkey={pubkey}
                          className="w-full"
                        />
                      </>
                    )}
                    {isOwnProfile && user && (
                      <Link to="/edit-profile" className="w-full">
                        <Button variant="outline" className="w-full">
                          Edit Profile
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stats?.followers || 0}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stats?.following || 0}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stats?.posts || 0}</p>
                    <p className="text-xs text-muted-foreground">Notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Box */}
            <Card className="bg-card/90 backdrop-blur border-2 border-accent">
              <CardHeader className="bg-gradient-to-r from-accent to-primary text-accent-foreground">
                <CardTitle className="text-lg">Contacting {displayName}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <a href={metadata?.website} target="_blank" rel="noopener noreferrer" 
                     className="text-primary hover:underline">
                    {metadata?.website || 'No website'}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">{metadata?.lud16 || 'No Lightning address'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Interests - NIP-51 */}
            {(userInterests && userInterests.length > 0) || (heroSets && heroSets.length > 0) ? (
              <Card className="bg-card/90 backdrop-blur border-2 border-secondary">
                <CardHeader className="bg-gradient-to-r from-secondary to-accent text-secondary-foreground">
                  <CardTitle className="text-lg">{displayName}'s Interests</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    {userInterests && userInterests.length > 0 && (
                      <div>
                        <span className="font-bold">Interests:</span>{' '}
                        {userInterests.map((interest, idx) => (
                          <span key={interest}>
                            #{interest}{idx < userInterests.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    {heroSets && heroSets.length > 0 && (
                      <div>
                        <span className="font-bold">Heroes:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {heroSets.map((heroPubkey) => (
                            <HeroCard key={heroPubkey} pubkey={heroPubkey} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Profile Music Player */}
            <ProfileMusicPlayer displayName={displayName} votedTrack={votedTracks} />
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Blurbs - About Me */}
            <Card className="bg-card/90 backdrop-blur border-2 border-primary">
              <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <CardTitle className="text-lg">{displayName}'s Blurbs</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">About me:</h3>
                    <p className="whitespace-pre-wrap">
                      {metadata?.about || `Hey there! I'm ${displayName}, exploring the decentralized web through Nostr and vibing to Bitcoin music on Wavlake. 🎵⚡\n\nValue for value is the way.`}
                    </p>
                  </div>
                  {suggestedPeople && suggestedPeople.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-2">Who I'd like to meet:</h3>
                      <p className="mb-3">People who share similar interests:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {suggestedPeople.slice(0, 6).map((suggestedPubkey) => (
                          <SuggestedPersonCard key={suggestedPubkey} pubkey={suggestedPubkey} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top 8 Friends */}
            {followList && followList.length > 0 && (
              <Card className="bg-card/90 backdrop-blur border-2 border-secondary">
                <CardHeader className="bg-gradient-to-r from-secondary to-accent text-secondary-foreground">
                  <CardTitle className="text-lg">{displayName}'s Following</CardTitle>
                  <p className="text-sm">{displayName} follows {stats?.following || followList.length} people.</p>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-4">Top 8:</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {followList.slice(0, 8).map((friendPubkey) => (
                      <FriendCard key={friendPubkey} pubkey={friendPubkey} />
                    ))}
                  </div>
                  <div className="text-center mt-4">
                    <Link to={`/${nip19.npubEncode(pubkey)}/friends`} className="text-primary hover:underline font-bold">
                      View All People {displayName} Follows
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity/Blog */}
            <Card className="bg-card/90 backdrop-blur border-2 border-primary">
              <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                <CardTitle className="text-lg">{displayName}'s Latest Blog Entries</CardTitle>
                <a href="#" className="text-sm underline text-primary-foreground hover:opacity-80">[View Blog]</a>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {postsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : recentPosts && recentPosts.length > 0 ? (
                  recentPosts.slice(0, 5).map((post) => (
                    <div key={post.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold">
                          {new Date(post.created_at * 1000).toLocaleDateString()}
                        </h4>
                        <div className="flex gap-2 text-sm">
                          <button className="text-primary hover:underline">Comments</button>
                          <button className="text-primary hover:underline">Kudos</button>
                        </div>
                      </div>
                      <p className="text-foreground text-sm line-clamp-3">{post.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">No blog entries yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="bg-card/90 backdrop-blur border-2 border-accent">
              <CardHeader className="bg-gradient-to-r from-accent to-secondary text-accent-foreground">
                <CardTitle className="text-lg">Comments</CardTitle>
                <p className="text-sm">Latest comments from the community</p>
              </CardHeader>
              <CardContent className="p-4">
                {/* Using a mock event for the comments root */}
                <CommentsSection 
                  root={{
                    id: pubkey,
                    pubkey: pubkey,
                    created_at: Math.floor(Date.now() / 1000),
                    kind: 0,
                    tags: [],
                    content: '',
                    sig: ''
                  } as NostrEvent}
                  title=""
                  emptyStateMessage="Be the first to comment!"
                  emptyStateSubtitle="Leave some love on this profile"
                  limit={50}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

        {/* Custom CSS for MySpace aesthetic */}
        <style>{`
          .myspace-profile {
            font-family: Verdana, Arial, sans-serif;
          }
          .myspace-profile h1, .myspace-profile h2, .myspace-profile h3 {
            font-family: Georgia, serif;
          }
          .myspace-profile .card {
            box-shadow: 3px 3px 0px rgba(0,0,0,0.3);
          }
        `}</style>
      </div>
    </MainLayout>
  );
}

// Profile Music Player Component
function ProfileMusicPlayer({ displayName, votedTrack }: { displayName: string; votedTrack: MusicTrack | null | undefined }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useGlobalMusicPlayer();
  
  const profileTrack = votedTrack;
  const isProfileTrackPlaying = currentTrack?.id === profileTrack?.id && isPlaying;
  
  const handlePlayPause = () => {
    if (!profileTrack) return;
    
    if (isProfileTrackPlaying) {
      togglePlay();
    } else {
      playTrack(profileTrack);
    }
  };
  
  return (
    <Card className="bg-card/90 backdrop-blur border-2 border-primary">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardTitle className="text-lg flex items-center gap-2">
          <Music2 className="w-5 h-5" />
          {displayName}'s Profile Song
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {profileTrack ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform"
            >
              {isProfileTrackPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{profileTrack.title}</p>
              <p className="text-sm text-muted-foreground truncate">{profileTrack.artist}</p>
            </div>
            {profileTrack.albumArtUrl && (
              <img 
                src={profileTrack.albumArtUrl} 
                alt={profileTrack.title}
                className="w-12 h-12 rounded object-cover"
              />
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Music2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No profile song set</p>
            <p className="text-xs mt-1">Zap some tracks on Wavlake to set your vibe!</p>
          </div>
        )}
        
        {/* Classic MySpace autoplay notice */}
        {profileTrack && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground italic">
              🎵 This song defines {displayName}'s vibe
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Friend Card Component for Top 8
function FriendCard({ pubkey }: { pubkey: string }) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(pubkey).slice(0, 10);
  const npub = nip19.npubEncode(pubkey);

  return (
    <a href={`/${npub}`} className="block text-center group">
      <div className="relative">
        <Avatar className="w-full h-auto aspect-square border-2 border-muted group-hover:border-primary transition-colors">
          <AvatarImage src={metadata?.picture} alt={displayName} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-primary-foreground">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <p className="text-xs mt-1 text-foreground group-hover:text-primary transition-colors truncate">
        {displayName}
      </p>
    </a>
  );
}

// Hero Card Component for Heroes section
function HeroCard({ pubkey }: { pubkey: string }) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(pubkey).slice(0, 8);
  const npub = nip19.npubEncode(pubkey);

  return (
    <a href={`/${npub}`} className="inline-flex items-center gap-1 text-xs group">
      <Avatar className="w-6 h-6 border border-muted group-hover:border-primary transition-colors">
        <AvatarImage src={metadata?.picture} alt={displayName} />
        <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-accent text-primary-foreground">
          {displayName.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-foreground group-hover:text-primary transition-colors truncate max-w-16">
        {displayName}
      </span>
    </a>
  );
}

// Suggested Person Card Component for "Who I'd like to meet"
function SuggestedPersonCard({ pubkey }: { pubkey: string }) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(pubkey).slice(0, 8);
  const npub = nip19.npubEncode(pubkey);

  return (
    <a href={`/${npub}`} className="block text-center group">
      <div className="relative">
        <Avatar className="w-full h-auto aspect-square border border-muted group-hover:border-primary transition-colors">
          <AvatarImage src={metadata?.picture} alt={displayName} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-secondary to-accent text-secondary-foreground">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <p className="text-[10px] mt-1 text-foreground group-hover:text-primary transition-colors truncate">
        {displayName}
      </p>
    </a>
  );
}