import { Settings, Cloud, HardDrive, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function AppSettings() {
  const { settings, updateSetting, isLoading, isRemoteEnabled } = useAppSettings();
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Please log in to access settings</p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold">App Settings</h1>
          <Badge variant="secondary" className="gap-1">
            {isRemoteEnabled ? (
              <>
                <Cloud className="h-3 w-3" />
                Synced
              </>
            ) : (
              <>
                <HardDrive className="h-3 w-3" />
                Local
              </>
            )}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Manage your NostrMusic preferences
          {user ? ' - Settings are automatically synced via Nostr' : ' - Log in to sync settings across devices'}
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="relays">Relays</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your NostrMusic experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="listening-status" className="text-base font-medium">
                    Publish status for listening
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Share what you're listening to as a live status on Nostr (NIP-38)
                  </p>
                </div>
                <Switch
                  id="listening-status"
                  checked={settings.publishListeningStatus}
                  onCheckedChange={(checked) => updateSetting('publishListeningStatus', checked)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relays" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relay Settings</CardTitle>
              <CardDescription>
                Manage your Nostr relay connections
              </CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium mb-2">Feature Coming Soon</p>
                <p className="text-sm">Advanced relay management will be available in a future update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}