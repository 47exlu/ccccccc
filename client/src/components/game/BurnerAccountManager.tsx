import React, { useState } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio';
import { SocialMediaAccount } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatNumber } from '@/lib/utils';
import { AlertTriangle, Check, Loader2, Trash2, User, UserPlus, XCircle } from 'lucide-react';

import { TwitterIcon, InstagramIcon, TikTokIcon } from '@/assets/icons';

const BurnerAccountCard = ({ 
  platform, 
  account, 
  onPost, 
  onDelete 
}: { 
  platform: string, 
  account: SocialMediaAccount, 
  onPost: (handle: string) => void, 
  onDelete: (handle: string) => void 
}) => {
  const getPlatformIcon = () => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <TwitterIcon size={16} className="text-[#1DA1F2]" />;
      case 'instagram':
        return <InstagramIcon size={16} className="text-[#E1306C]" />;
      case 'tiktok':
        return <TikTokIcon className="w-4 h-4" />;
      default:
        return <User size={16} />;
    }
  };

  const getPlatformClass = () => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return 'bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/30';
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 text-pink-500 border-pink-500/30';
      case 'tiktok':
        return 'bg-black/10 text-gray-700 dark:text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Card className={`overflow-hidden ${getPlatformClass()} border`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getPlatformIcon()}
            <span className="font-bold">@{account.handle}</span>
            <Badge variant="outline" className="ml-1 text-xs">Burner</Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={() => onDelete(account.handle)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
        {account.displayName && account.displayName !== account.handle && (
          <CardDescription className="mt-1">{account.displayName}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {account.bio && (
          <p className="text-sm mb-3 line-clamp-2">{account.bio}</p>
        )}
        <div className="flex justify-between text-sm">
          <div>
            <div className="font-bold">{formatNumber(account.followers)}</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div>
            <div className="font-bold">{account.posts.length}</div>
            <div className="text-xs text-gray-500">Posts</div>
          </div>
          <div>
            <div className="font-bold">{account.engagement}%</div>
            <div className="text-xs text-gray-500">Engagement</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full"
          onClick={() => onPost(account.handle)}
        >
          Post as @{account.handle}
        </Button>
      </CardFooter>
    </Card>
  );
};

const AccountCreationForm = ({ 
  platform, 
  onSubmit, 
  onCancel 
}: { 
  platform: string, 
  onSubmit: (handle: string, displayName: string, bio: string) => void, 
  onCancel: () => void 
}) => {
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!handle) {
      setError('Username is required');
      return;
    }

    // Handle can only contain letters, numbers, and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate a brief loading state
    setTimeout(() => {
      onSubmit(handle, displayName, bio);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="handle" className="block text-sm font-medium mb-1">
          Username (required)
        </label>
        <div className="flex items-center">
          <span className="text-gray-500 mr-1">@</span>
          <Input
            id="handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="coolburner123"
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium mb-1">
          Display Name (optional)
        </label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="My Burner Account"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-1">
          Bio (optional)
        </label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Just a burner account for sending anonymous tweets"
          rows={3}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm flex items-center gap-1">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading || !handle}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Check size={16} className="mr-2" />
              Create Account
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const PostForm = ({ 
  platform, 
  account, 
  onSubmit, 
  onCancel 
}: { 
  platform: string, 
  account: SocialMediaAccount, 
  onSubmit: (content: string) => void, 
  onCancel: () => void 
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    setLoading(true);
    
    // Simulate a brief loading state
    setTimeout(() => {
      onSubmit(content);
      setLoading(false);
    }, 500);
  };

  const getPlatformPlaceholder = () => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return "What's happening?";
      case 'instagram':
        return "Write a caption...";
      case 'tiktok':
        return "Add a description...";
      default:
        return "Write something...";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          <User size={20} />
        </div>
        <div>
          <div className="font-medium">@{account.handle}</div>
          <div className="text-xs text-gray-500">{account.displayName}</div>
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={getPlatformPlaceholder()}
        rows={4}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            'Post'
          )}
        </Button>
      </div>
    </div>
  );
};

export function BurnerAccountManager() {
  const [activeTab, setActiveTab] = useState<"twitter" | "instagram" | "tiktok">("twitter");
  const socialMediaStats = useRapperGame(state => state.socialMediaStats);
  const createBurnerAccount = useRapperGame(state => state.createBurnerAccount);
  const postFromBurnerAccount = useRapperGame(state => state.postFromBurnerAccount);
  const deleteBurnerAccount = useRapperGame(state => state.deleteBurnerAccount);
  const { playSuccess } = useAudio();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SocialMediaAccount | null>(null);

  // Get burner accounts for the active platform
  const getBurnerAccounts = () => {
    if (activeTab === 'twitter') {
      return socialMediaStats?.twitter?.burnerAccounts || [];
    } else if (activeTab === 'instagram') {
      return socialMediaStats?.instagram?.burnerAccounts || [];
    } else if (activeTab === 'tiktok') {
      return socialMediaStats?.tiktok?.burnerAccounts || [];
    }
    return [];
  };

  const burnerAccounts = getBurnerAccounts();
  
  // Platform display name formatting
  const getPlatformDisplayName = () => {
    switch (activeTab) {
      case 'twitter':
        return 'Twitter';
      case 'instagram':
        return 'Instagram';
      case 'tiktok':
        return 'TikTok';
      default:
        return activeTab;
    }
  };

  // Create a new burner account
  const handleCreateAccount = (handle: string, displayName: string, bio: string) => {
    const result = createBurnerAccount(getPlatformDisplayName(), handle, displayName, bio);
    if (result) {
      playSuccess?.();
      setShowCreateDialog(false);
    }
  };

  // Post from a burner account
  const handlePost = (handle: string) => {
    const account = burnerAccounts.find(a => a.handle === handle);
    if (account) {
      setSelectedAccount(account);
      setShowPostDialog(true);
    }
  };

  // Submit a post from a burner account
  const handleSubmitPost = (content: string) => {
    if (selectedAccount) {
      postFromBurnerAccount(getPlatformDisplayName(), selectedAccount.handle, content);
      playSuccess?.();
      setShowPostDialog(false);
      setSelectedAccount(null);
    }
  };

  // Delete a burner account
  const handleDeleteAccount = (handle: string) => {
    if (window.confirm(`Are you sure you want to delete the account @${handle}?`)) {
      deleteBurnerAccount(getPlatformDisplayName(), handle);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Burner Accounts</h2>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => setShowCreateDialog(true)}
        >
          <UserPlus size={16} className="mr-2" />
          Create New Account
        </Button>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Create and manage anonymous burner accounts to interact with other accounts or spread rumors without risking your main artist profile.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mt-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="twitter" className="flex items-center gap-2">
            <TwitterIcon size={18} />
            <span>Twitter</span>
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex items-center gap-2">
            <InstagramIcon size={18} />
            <span>Instagram</span>
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="flex items-center gap-2">
            <TikTokIcon className="w-4 h-4" />
            <span>TikTok</span>
          </TabsTrigger>
        </TabsList>

        {['twitter', 'instagram', 'tiktok'].map((platform) => (
          <TabsContent key={platform} value={platform}>
            {burnerAccounts.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <User size={48} className="mb-4 opacity-30" />
                  <p className="mb-2 font-medium">No burner accounts yet</p>
                  <p className="text-sm mb-4">
                    Create a burner account to interact anonymously on {getPlatformDisplayName()}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <UserPlus size={16} className="mr-2" />
                    Create Burner Account
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {burnerAccounts.map((account) => (
                  <BurnerAccountCard
                    key={account.handle}
                    platform={getPlatformDisplayName()}
                    account={account}
                    onPost={handlePost}
                    onDelete={handleDeleteAccount}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Account Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Burner Account on {getPlatformDisplayName()}</DialogTitle>
            <DialogDescription>
              This account will be completely separate from your main artist profile.
            </DialogDescription>
          </DialogHeader>
          
          <AccountCreationForm
            platform={getPlatformDisplayName()}
            onSubmit={handleCreateAccount}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Post Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post as @{selectedAccount?.handle}</DialogTitle>
            <DialogDescription>
              Create a post from your burner account on {getPlatformDisplayName()}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAccount && (
            <PostForm
              platform={getPlatformDisplayName()}
              account={selectedAccount}
              onSubmit={handleSubmitPost}
              onCancel={() => {
                setShowPostDialog(false);
                setSelectedAccount(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}