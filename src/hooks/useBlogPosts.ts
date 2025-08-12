import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';


export interface BlogPost {
  id: string;
  pubkey: string;
  dTag: string;
  title?: string;
  summary?: string;
  image?: string;
  content: string;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
  hashtags: string[];
  isDraft: boolean;
}

function validateBlogPost(event: NostrEvent): boolean {
  // Must be kind 30023 (published) or 30024 (draft)
  if (![30023, 30024].includes(event.kind)) return false;
  
  const dTag = event.tags.find(([tag]) => tag === 'd')?.[1];
  
  // Must have d tag and content
  return !!(dTag && event.content.trim());
}

function parseBlogPost(event: NostrEvent): BlogPost {
  const dTag = event.tags.find(([tag]) => tag === 'd')?.[1] || '';
  const title = event.tags.find(([tag]) => tag === 'title')?.[1];
  const summary = event.tags.find(([tag]) => tag === 'summary')?.[1];
  const image = event.tags.find(([tag]) => tag === 'image')?.[1];
  const publishedAt = event.tags.find(([tag]) => tag === 'published_at')?.[1];
  
  // Parse hashtags from t tags
  const hashtags = event.tags
    .filter(([tag]) => tag === 't')
    .map(([_tag, hashtag]) => hashtag)
    .filter(Boolean);
  
  const isDraft = event.kind === 30024;
  
  return {
    id: event.id,
    pubkey: event.pubkey,
    dTag,
    title,
    summary,
    image,
    content: event.content,
    publishedAt: publishedAt ? parseInt(publishedAt) : undefined,
    createdAt: event.created_at,
    updatedAt: event.created_at, // In NIP-23, created_at is the last update time
    hashtags,
    isDraft,
  };
}

export function useBlogPosts(authorPubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['blog-posts', authorPubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      // Query for published long-form content (kind:30023)
      const events = await nostr.query([
        {
          kinds: [30023], // Only published posts, not drafts
          ...(authorPubkey && { authors: [authorPubkey] }),
          limit: 50,
        }
      ], { signal });

      // Validate and parse events
      const validEvents = events.filter(validateBlogPost);
      const blogPosts = validEvents.map(parseBlogPost);
      
      // Sort by published date, then by creation/update time (newest first)
      return blogPosts.sort((a, b) => {
        // If both have published dates, sort by that
        if (a.publishedAt && b.publishedAt) {
          return b.publishedAt - a.publishedAt;
        }
        
        // If only one has published date, prioritize it
        if (a.publishedAt && !b.publishedAt) return -1;
        if (!a.publishedAt && b.publishedAt) return 1;
        
        // Otherwise sort by update time (newest first)
        return b.updatedAt - a.updatedAt;
      });
    },
  });
}

// Hook to get a specific blog post by d-tag
export function useBlogPost(dTag: string, authorPubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['blog-post', authorPubkey, dTag],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      // Query for specific blog post
      const events = await nostr.query([
        {
          kinds: [30023],
          ...(authorPubkey && { authors: [authorPubkey] }),
          '#d': [dTag],
          limit: 1,
        }
      ], { signal });

      if (events.length === 0) return null;
      
      const event = events[0];
      if (!validateBlogPost(event)) return null;
      
      return parseBlogPost(event);
    },
    enabled: !!dTag,
  });
}