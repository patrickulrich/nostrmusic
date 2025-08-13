import { useParams, Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Users } from 'lucide-react';
import NotFound from './NotFound';
import type { NostrMetadata } from '@nostrify/nostrify';

export function FriendsPage() {
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
  
  // Get the profile owner's data - call hooks before conditional returns
  const author = useAuthor(pubkey || 'invalid');
  const metadata: NostrMetadata | undefined = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey || 'invalid');
  
  // Fetch user's full follow list
  const { data: followList, isLoading } = useQuery({
    queryKey: ['user-full-follows', pubkey],
    enabled: !!pubkey,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const events = await nostr.query(
        [{ kinds: [3], authors: [pubkey], limit: 1 }],
        { signal }
      );
      
      const followListEvent = events.sort((a, b) => b.created_at - a.created_at)[0];
      if (!followListEvent) return [];
      
      // Extract all follows
      const follows = followListEvent.tags
        .filter(([tag]) => tag === 'p')
        .map(([_, pubkey, relay = "", petname = ""]) => ({
          pubkey,
          relay: relay || undefined,
          petname: petname || undefined,
        }));
      
      return follows;
    },
  });
  
  if (!pubkey) {
    return <NotFound />;
  }
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
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
                <h1 className="text-2xl font-bold">{displayName}'s Friends</h1>
                <p className="text-sm text-muted-foreground">
                  {followList?.length || 0} friends
                </p>
              </div>
            </div>
          </div>
          
          {/* Friends Grid */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Friends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="w-full aspect-square rounded-lg" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : followList && followList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {followList.map((follow) => (
                    <FriendCard 
                      key={follow.pubkey} 
                      pubkey={follow.pubkey} 
                      petname={follow.petname}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{displayName} hasn't followed anyone yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

// Friend Card Component
function FriendCard({ pubkey, petname }: { pubkey: string; petname?: string }) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const displayName = petname || metadata?.name || genUserName(pubkey).slice(0, 12);
  const npub = nip19.npubEncode(pubkey);

  return (
    <Link 
      to={`/${npub}`} 
      className="block group"
    >
      <div className="space-y-2 text-center">
        <div className="relative">
          <Avatar className="w-full h-auto aspect-square border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary transition-colors">
            <AvatarImage src={metadata?.picture} alt={displayName} />
            <AvatarFallback className="text-lg bg-gradient-to-br from-blue-400 to-purple-400 text-white">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {displayName}
          </p>
          {metadata?.nip05 && (
            <p className="text-xs text-muted-foreground truncate">
              {metadata.nip05}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}