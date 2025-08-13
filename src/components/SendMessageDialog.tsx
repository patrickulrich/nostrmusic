import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useNostr } from '@nostrify/react';
import { useToast } from '@/hooks/useToast';
import { genUserName } from '@/lib/genUserName';
import type { NostrMetadata, NostrEvent } from '@nostrify/nostrify';
import { createNIP17DirectMessage, type DirectMessageData } from '@/lib/nip17';
import { MessageCircle, Send, User, Lock } from 'lucide-react';

interface SendMessageDialogProps {
  recipientPubkey: string;
  children?: React.ReactNode;
  className?: string;
}

export function SendMessageDialog({ recipientPubkey, children, className }: SendMessageDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useCurrentUser();
  const { nostr } = useNostr();
  const { toast } = useToast();
  
  // Get recipient's profile data
  const recipient = useAuthor(recipientPubkey);
  const recipientMetadata: NostrMetadata | undefined = recipient.data?.metadata;
  const recipientDisplayName = recipientMetadata?.display_name || recipientMetadata?.name || genUserName(recipientPubkey);

  const handleSendMessage = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to send messages.',
        variant: 'destructive',
      });
      return;
    }

    if (!user.signer.nip44) {
      toast({
        title: 'NIP-44 Encryption Required',
        description: 'Your Nostr client must support NIP-44 encryption for private messaging. Please update your extension or use a compatible client.',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message to send.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare message data
      const messageData: DirectMessageData = {
        message: message.trim(),
        subject: subject.trim() || undefined,
      };

      // Create and send NIP-17 encrypted message with proper sealing and gift wrapping
      await createNIP17DirectMessage(
        messageData,
        user.signer as { 
          getPublicKey: () => Promise<string>; 
          signEvent: (event: unknown) => Promise<NostrEvent>;
          nip44: { encrypt: (pubkey: string, message: string) => Promise<string> }; 
        }, // Type assertion since we already checked nip44 exists
        recipientPubkey,
        nostr // Pass nostr.event directly to avoid re-signing gift wraps
      );

      toast({
        title: 'Message Sent!',
        description: `Your message has been sent privately to ${recipientDisplayName}.`,
      });

      // Reset form and close modal
      setSubject('');
      setMessage('');
      setIsOpen(false);

    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Failed to Send',
        description: 'Could not send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Button 
        variant="outline" 
        className={className}
        onClick={() => {
          toast({
            title: 'Authentication Required',
            description: 'Please sign in to send messages.',
            variant: 'destructive',
          });
        }}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Send Message
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            className={className}
            title={`Send a private message to ${recipientDisplayName}`}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Send Private Message
          </DialogTitle>
          <DialogDescription>
            Send an encrypted private message using NIP-17.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient Preview */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={recipientMetadata?.picture} alt={recipientDisplayName} />
                <AvatarFallback>
                  {recipientDisplayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">
                  {recipientDisplayName}
                </h4>
                {recipientMetadata?.nip05 && (
                  <p className="text-sm text-muted-foreground truncate">
                    ✓ {recipientMetadata.nip05}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Encrypted</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subject (optional) */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input
              id="subject"
              placeholder="Message subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
              required
            />
          </div>

          {/* Encryption Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>This message will be encrypted end-to-end using NIP-17 and NIP-44</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage}
            disabled={isSubmitting || !message.trim()}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-3 w-3" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}