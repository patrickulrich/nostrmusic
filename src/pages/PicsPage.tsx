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
import { ArrowLeft, Camera, ExternalLink } from 'lucide-react';
import NotFound from './NotFound';

interface PicturePost {
  event: NostrEvent;
  title: string;
  images: Array<{
    url: string;
    alt?: string;
    hash?: string;
    dimensions?: string;
    mimeType?: string;
    blurhash?: string;
  }>;
}

export function PicsPage() {
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
  
  // Fetch user's picture posts (kind 20)
  const { data: picturePosts, isLoading } = useQuery({
    queryKey: ['user-pics', pubkey],
    enabled: !!pubkey,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const events = await nostr.query(
        [{ kinds: [20], authors: [pubkey], limit: 50 }],
        { signal }
      );
      
      // Process events to extract image metadata
      const processedPosts: PicturePost[] = [];
      
      events.forEach(event => {
        const titleTag = event.tags.find(([tag]) => tag === 'title')?.[1];
        const title = titleTag || 'Untitled';
        
        // Extract images from imeta tags
        const images = event.tags
          .filter(([tag]) => tag === 'imeta')
          .map(imetaTag => {
            const attributes = imetaTag.slice(1);
            const imageData: PicturePost['images'][0] = { url: '' };
            
            attributes.forEach(attr => {
              if (attr.startsWith('url ')) {
                imageData.url = attr.substring(4);
              } else if (attr.startsWith('alt ')) {
                imageData.alt = attr.substring(4);
              } else if (attr.startsWith('x ')) {
                imageData.hash = attr.substring(2);
              } else if (attr.startsWith('dim ')) {
                imageData.dimensions = attr.substring(4);
              } else if (attr.startsWith('m ')) {
                imageData.mimeType = attr.substring(2);
              } else if (attr.startsWith('blurhash ')) {
                imageData.blurhash = attr.substring(9);
              }
            });
            
            return imageData;
          })
          .filter(img => img.url); // Only include images with URLs
        
        if (images.length > 0) {
          processedPosts.push({
            event,
            title,
            images
          });
        }
      });
      
      return processedPosts.sort((a, b) => b.event.created_at - a.event.created_at);
    },
  });
  
  if (!pubkey) {
    return <NotFound />;
  }
  
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
                <h1 className="text-2xl font-bold">{displayName}'s Pictures</h1>
                <p className="text-sm text-muted-foreground">
                  {picturePosts?.length || 0} photo posts
                </p>
              </div>
            </div>
          </div>
          
          {/* Pictures Grid */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photo Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="w-full aspect-square rounded-lg" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : picturePosts && picturePosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {picturePosts.map((post) => (
                    <PicturePostCard key={post.event.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{displayName} hasn't posted any pictures yet</p>
                  <p className="text-sm mt-2">Picture posts using NIP-68 will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

// Picture Post Card Component
function PicturePostCard({ post }: { post: PicturePost }) {
  const primaryImage = post.images[0];
  const hasMultipleImages = post.images.length > 1;
  
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={primaryImage.url}
          alt={primaryImage.alt || post.title}
          className="w-full aspect-square object-cover rounded-t-lg"
          loading="lazy"
        />
        {hasMultipleImages && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            +{post.images.length - 1}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-t-lg" />
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
          {hasMultipleImages && (
            <button className="text-xs text-primary hover:underline flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              View All
            </button>
          )}
        </div>
        
        {primaryImage.dimensions && (
          <div className="text-xs text-muted-foreground mt-2">
            {primaryImage.dimensions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}