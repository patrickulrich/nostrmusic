import { useParams, Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Video, Play, Clock } from 'lucide-react';
import NotFound from './NotFound';

interface VideoPost {
  event: NostrEvent;
  title: string;
  duration?: number;
  type: 'long-form' | 'short-form';
  videos: Array<{
    url: string;
    mimeType?: string;
    dimensions?: string;
    hash?: string;
    previewImage?: string;
    quality?: string;
  }>;
}

export function VideosPage() {
  const { npub } = useParams<{ npub: string }>();
  const { nostr } = useNostr();
  
  // Decode the npub
  let pubkey: string = '';
  if (npub) {
    try {
      if (npub.startsWith('npub1')) {
        const decoded = nip19.decode(npub);
        if (decoded.type === 'npub') {
          pubkey = decoded.data;
        }
      }
    } catch {
      // Invalid npub
    }
  }
  
  // Get the profile owner's data
  const author = useAuthor(pubkey || 'invalid');
  const metadata: NostrMetadata | undefined = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey || 'invalid');
  
  // Fetch user's video posts (kinds 21 and 22)
  const { data: videoPosts, isLoading } = useQuery({
    queryKey: ['user-videos', pubkey],
    enabled: !!pubkey,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const events = await nostr.query(
        [{ kinds: [21, 22], authors: [pubkey], limit: 50 }],
        { signal }
      );
      
      // Process events to extract video metadata
      const processedPosts: VideoPost[] = [];
      
      events.forEach(event => {
        const titleTag = event.tags.find(([tag]) => tag === 'title')?.[1];
        const title = titleTag || 'Untitled Video';
        
        const durationTag = event.tags.find(([tag]) => tag === 'duration')?.[1];
        const duration = durationTag ? parseInt(durationTag) : undefined;
        
        // Determine video type based on kind
        const type: VideoPost['type'] = event.kind === 22 ? 'short-form' : 'long-form';
        
        // Extract videos from imeta tags
        const videos = event.tags
          .filter(([tag]) => tag === 'imeta')
          .map(imetaTag => {
            const attributes = imetaTag.slice(1);
            const videoData: VideoPost['videos'][0] = { url: '' };
            
            attributes.forEach(attr => {
              if (attr.startsWith('url ')) {
                videoData.url = attr.substring(4);
              } else if (attr.startsWith('m ')) {
                videoData.mimeType = attr.substring(2);
              } else if (attr.startsWith('dim ')) {
                videoData.dimensions = attr.substring(4);
              } else if (attr.startsWith('x ')) {
                videoData.hash = attr.substring(2);
              } else if (attr.startsWith('image ')) {
                videoData.previewImage = attr.substring(6);
              }
            });
            
            // Infer quality from dimensions
            if (videoData.dimensions) {
              const [, height] = videoData.dimensions.split('x').map(Number);
              if (height >= 1080) videoData.quality = '1080p';
              else if (height >= 720) videoData.quality = '720p';
              else if (height >= 480) videoData.quality = '480p';
            }
            
            return videoData;
          })
          .filter(video => video.url); // Only include videos with URLs
        
        if (videos.length > 0) {
          processedPosts.push({
            event,
            title,
            duration,
            type,
            videos
          });
        }
      });
      
      return processedPosts.sort((a, b) => b.event.created_at - a.event.created_at);
    },
  });
  
  if (!pubkey) {
    return <NotFound />;
  }
  
  const longFormVideos = videoPosts?.filter(v => v.type === 'long-form') || [];
  const shortFormVideos = videoPosts?.filter(v => v.type === 'short-form') || [];
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="max-w-6xl mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link to={`/${npub}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={metadata?.picture} alt={displayName} />
                <AvatarFallback>
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{displayName}'s Videos</h1>
                <p className="text-sm text-muted-foreground">
                  {videoPosts?.length || 0} video posts • {longFormVideos.length} long-form • {shortFormVideos.length} short-form
                </p>
              </div>
            </div>
          </div>
          
          {/* Long-form Videos */}
          {longFormVideos.length > 0 && (
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Long-form Videos
                  <Badge variant="secondary" className="ml-2 bg-primary-foreground/20 text-primary-foreground">
                    {longFormVideos.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {longFormVideos.map((post) => (
                    <VideoPostCard key={post.event.id} post={post} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Short-form Videos */}
          {shortFormVideos.length > 0 && (
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-secondary to-accent text-secondary-foreground">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Short-form Videos
                  <Badge variant="secondary" className="ml-2 bg-secondary-foreground/20 text-secondary-foreground">
                    {shortFormVideos.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {shortFormVideos.map((post) => (
                    <ShortVideoCard key={post.event.id} post={post} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Empty State */}
          {isLoading ? (
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Loading Videos...
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="w-full aspect-video rounded-lg" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (!videoPosts || videoPosts.length === 0) ? (
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-12">
                <div className="text-center text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{displayName} hasn't posted any videos yet</p>
                  <p className="text-sm mt-2">Video posts using NIP-71 (kinds 21 & 22) will appear here</p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </MainLayout>
  );
}

// Long-form Video Post Card Component
function VideoPostCard({ post }: { post: VideoPost }) {
  const primaryVideo = post.videos[0];
  const hasMultipleQuality = post.videos.length > 1;
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="relative">
        {primaryVideo.previewImage ? (
          <img
            src={primaryVideo.previewImage}
            alt={post.title}
            className="w-full aspect-video object-cover rounded-t-lg"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-video bg-muted rounded-t-lg flex items-center justify-center">
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-t-lg flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/70 rounded-full p-3">
              <Play className="h-6 w-6 text-white ml-0.5" />
            </div>
          </div>
        </div>
        
        {post.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(post.duration)}
          </div>
        )}
        
        {hasMultipleQuality && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            {post.videos.map(v => v.quality).filter(Boolean).join(', ')}
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{post.title}</h3>
        {post.event.content && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {post.event.content}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(post.event.created_at * 1000).toLocaleDateString()}
          </span>
          {primaryVideo.dimensions && (
            <span className="text-xs text-muted-foreground">
              {primaryVideo.dimensions}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Short-form Video Card Component (more compact)
function ShortVideoCard({ post }: { post: VideoPost }) {
  const primaryVideo = post.videos[0];
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    return `${seconds}s`;
  };
  
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="relative">
        {primaryVideo.previewImage ? (
          <img
            src={primaryVideo.previewImage}
            alt={post.title}
            className="w-full aspect-[9/16] object-cover rounded-t-lg"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[9/16] bg-muted rounded-t-lg flex items-center justify-center">
            <Video className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-t-lg flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/70 rounded-full p-2">
              <Play className="h-4 w-4 text-white ml-0.5" />
            </div>
          </div>
        </div>
        
        {post.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(post.duration)}
          </div>
        )}
      </div>
      
      <CardContent className="p-2">
        <h3 className="font-medium text-xs line-clamp-2 leading-tight">{post.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(post.event.created_at * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </CardContent>
    </Card>
  );
}