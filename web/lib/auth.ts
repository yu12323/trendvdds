import type { User } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export function toAppUser(user: User | null): AppUser | null {
  if (!user?.email) return null;

  const metadataName =
    user.user_metadata?.display_name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name;
  const metadataAvatar = user.user_metadata?.avatar_url;

  return {
    id: user.id,
    email: user.email,
    displayName:
      typeof metadataName === 'string' && metadataName.trim()
        ? metadataName.trim()
        : user.email.split('@')[0],
    avatarUrl:
      typeof metadataAvatar === 'string' && metadataAvatar.trim()
        ? metadataAvatar
        : null,
  };
}
