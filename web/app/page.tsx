'use client';

import React, { useState, useEffect } from 'react';
import TopHeader from '../components/TopHeader';
import Navbar, { TabType } from '../components/Navbar';
import LandingView from '../components/LandingView';
import CreatePostView, { Trait, TraitSuggestion } from '../components/CreatePostView';
import ResultsView from '../components/ResultsView';
import AuctionView from '../components/AuctionView';
import { FeedView } from '../components/FeedView';
import { ProfileView } from '../components/ProfileView';
import QwenView from '../components/QwenView';
import BidModal from '../components/BidModal';
import AddTraitModal from '../components/AddTraitModal';
import { supabase } from '../lib/supabase';
import { AppUser, toAppUser } from '../lib/auth';

interface AuctionData {
  id: string;
  title: string;
  description: string;
  currentBid: number;
  remainingSeconds: number;
  iconType?: string;
}

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [previousTab, setPreviousTab] = useState<TabType>('home');
  const [showResults, setShowResults] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Não foi possível restaurar a sessão do usuário:', error);
        return;
      }
      if (isMounted) setCurrentUser(toAppUser(data.session?.user ?? null));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(toAppUser(session?.user ?? null));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Live indicators
  const [liveUsers, setLiveUsers] = useState(1247);
  const [liveViewers, setLiveViewers] = useState(892);
  const [postsCreated, setPostsCreated] = useState(3240);

  // Auctions data
  const [auctions, setAuctions] = useState<AuctionData[]>([
    {
      id: 'banner_home',
      title: 'Banner Home',
      description: 'Aparece na página inicial.',
      currentBid: 2450,
      remainingSeconds: 9258,
      iconType: 'home',
    },
    {
      id: 'banner_create',
      title: 'Banner Criar Post',
      description: 'Durante a criação do post.',
      currentBid: 1780,
      remainingSeconds: 4725,
      iconType: 'plus',
    },
    {
      id: 'banner_results',
      title: 'Banner Resultados',
      description: 'Exibido após gerar as imagens.',
      currentBid: 980,
      remainingSeconds: 12127,
      iconType: 'check',
    },
    {
      id: 'banner_feed',
      title: 'Banner Feed',
      description: 'No feed principal.',
      currentBid: 1250,
      remainingSeconds: 3393,
      iconType: 'camera',
    },
  ]);

  // Selected auction for bidding
  const [activeBidAuction, setActiveBidAuction] = useState<AuctionData | null>(null);

  // Trait modal
  const [isAddTraitOpen, setIsAddTraitOpen] = useState(false);

  // Containers count (default 4, user can click +1)
  const [containersCount, setContainersCount] = useState<number>(4);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [qwenImagesBySlot, setQwenImagesBySlot] = useState<Record<number, string>>({});
  const [cloudflareImagesBySlot, setCloudflareImagesBySlot] = useState<Record<number, string>>({});

  // Base traits template
  const baseTraits: Trait[] = [
    // Beleza
    { id: 'b1', name: 'olhos verdes', isBeauty: true, enabled: true },
    { id: 'b2', name: 'cabelo loiro', isBeauty: true, enabled: true },
    { id: 'b3', name: 'barba', isBeauty: true, enabled: true },
    { id: 'b4', name: 'tatuagem braço', isBeauty: true, enabled: false },
    { id: 'b5', name: 'tatuagem pescoço', isBeauty: true, enabled: false },
    { id: 'b6', name: 'musculoso', isBeauty: true, enabled: false },
    // Feiura
    { id: 'u1', name: 'barba mal feita', isBeauty: false, enabled: true },
    { id: 'u2', name: 'sem barba', isBeauty: false, enabled: false },
    { id: 'u3', name: 'pálido', isBeauty: false, enabled: false },
    { id: 'u4', name: 'sujo', isBeauty: false, enabled: false },
    { id: 'u5', name: 'roupa rasgada', isBeauty: false, enabled: false },
    { id: 'u6', name: 'postura desleixada', isBeauty: false, enabled: false },
  ];

  // Traits per image container map
  const [imageTraitsMap, setImageTraitsMap] = useState<Record<number, Trait[]>>(() => {
    const initialMap: Record<number, Trait[]> = {};
    for (let i = 0; i < 4; i++) {
      initialMap[i] = baseTraits.map((t) => ({ ...t }));
    }
    return initialMap;
  });

  // Trait suggestions from community
  const [traitSuggestions, setTraitSuggestions] = useState<TraitSuggestion[]>([
    {
      id: 'sug_1',
      name: 'olhos verdes',
      isBeauty: true,
      creatorName: 'Leonardo',
      creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop',
      usageCount: 1420,
    },
    {
      id: 'sug_2',
      name: 'tatuagem dragão',
      isBeauty: true,
      creatorName: 'Larissa',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop',
      usageCount: 980,
    },
    {
      id: 'sug_3',
      name: 'barba lenhador',
      isBeauty: true,
      creatorName: 'Pedro',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
      usageCount: 840,
    },
    {
      id: 'sug_4',
      name: 'cabelo platinado',
      isBeauty: true,
      creatorName: 'Mariana',
      creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop',
      usageCount: 760,
    },
    {
      id: 'sug_5',
      name: 'olheiras pesadas',
      isBeauty: false,
      creatorName: 'Caio',
      creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop',
      usageCount: 610,
    },
    {
      id: 'sug_6',
      name: 'sorriso perfeito',
      isBeauty: true,
      creatorName: 'Beatriz',
      creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop',
      usageCount: 590,
    },
  ]);

  // Results State
  const [resultData, setResultData] = useState<{
    postId: string;
    images: string[];
    captions: string[];
    sources: Array<'fooocus' | 'comfyui' | 'qwen' | 'cloudflare' | 'original'>;
    tiktokTitle: string;
  }>({
    postId: '',
    images: [],
    captions: [],
    sources: [],
    tiktokTitle: '',
  });
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published' | 'error'>('idle');
  const [publishError, setPublishError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch remote suggestions from Supabase
  useEffect(() => {
    const fetchRemoteSuggestions = async () => {
      try {
        const { data } = await supabase
          .from('custom_traits')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (data && data.length > 0) {
          const mapped: TraitSuggestion[] = data.map((item: any) => ({
            id: item.id || `remote_${Math.random()}`,
            name: item.name,
            isBeauty: item.is_beauty,
            creatorName: item.creator_name || 'Comunidade',
            creatorAvatar: item.creator_avatar || undefined,
            usageCount: item.usage_count || 1,
          }));
          setTraitSuggestions((prev) => {
            const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
            const newOnes = mapped.filter((m) => !existingNames.has(m.name.toLowerCase()));
            return [...newOnes, ...prev];
          });
        }
      } catch (e) {
        // Fallback to local suggestions
      }
    };
    fetchRemoteSuggestions();
  }, []);

  // Tab navigation
  const handleSelectTab = (tab: TabType) => {
    setPreviousTab(currentTab);
    setCurrentTab(tab);
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Bid Modal
  const handleOpenBid = (auctionId: string) => {
    const found = auctions.find((a) => a.id === auctionId);
    if (found) {
      setActiveBidAuction(found);
    }
  };

  // Submit Bid
  const handleSubmitBid = async (auctionId: string, email: string, amount: number) => {
    setAuctions((prev) =>
      prev.map((item) => (item.id === auctionId ? { ...item, currentBid: amount } : item))
    );
    setActiveBidAuction(null);

    // Sync to Supabase
    try {
      await supabase.from('bids').insert({
        banner_id: auctionId,
        amount,
        bidder_email: email,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase bid sync fallback:', err);
    }
  };

  // 1. ADD CONTAINER (+1)
  const handleAddContainer = () => {
    const nextCount = containersCount + 1;
    const nextIndex = nextCount - 1;

    setImageTraitsMap((prev) => ({
      ...prev,
      [nextIndex]: baseTraits.map((t) => ({ ...t })),
    }));

    setContainersCount(nextCount);
  };

  // 2. REMOVE CONTAINER
  const handleRemoveContainer = (index: number) => {
    if (containersCount <= 4) return;
    const nextCount = containersCount - 1;
    setImageTraitsMap((prev) => {
      const updated: Record<number, Trait[]> = {};
      let k = 0;
      for (let i = 0; i < containersCount; i++) {
        if (i !== index) {
          updated[k] = prev[i] || baseTraits.map((t) => ({ ...t }));
          k++;
        }
      }
      return updated;
    });
    setQwenImagesBySlot((prev) => {
      const updated: Record<number, string> = {};
      Object.entries(prev).forEach(([key, image]) => {
        const currentIndex = Number(key);
        if (currentIndex < index) updated[currentIndex] = image;
        if (currentIndex > index) updated[currentIndex - 1] = image;
      });
      return updated;
    });
    setCloudflareImagesBySlot((prev) => {
      const updated: Record<number, string> = {};
      Object.entries(prev).forEach(([key, image]) => {
        const currentIndex = Number(key);
        if (currentIndex < index) updated[currentIndex] = image;
        if (currentIndex > index) updated[currentIndex - 1] = image;
      });
      return updated;
    });
    setContainersCount(nextCount);
  };

  const handleAcceptQwenImage = (imageIndex: number, image: string) => {
    setCloudflareImagesBySlot((prev) => {
      const updated = { ...prev };
      delete updated[imageIndex];
      return updated;
    });
    setQwenImagesBySlot((prev) => ({ ...prev, [imageIndex]: image }));
  };

  const handleAcceptCloudflareImage = (imageIndex: number, image: string) => {
    setQwenImagesBySlot((prev) => {
      const updated = { ...prev };
      delete updated[imageIndex];
      return updated;
    });
    setCloudflareImagesBySlot((prev) => ({ ...prev, [imageIndex]: image }));
  };

  const handleRemoveQwenImage = (imageIndex: number) => {
    setQwenImagesBySlot((prev) => {
      const updated = { ...prev };
      delete updated[imageIndex];
      return updated;
    });
  };

  const handleRemoveCloudflareImage = (imageIndex: number) => {
    setCloudflareImagesBySlot((prev) => {
      const updated = { ...prev };
      delete updated[imageIndex];
      return updated;
    });
  };

  // 3. TOGGLE TRAIT FOR SPECIFIC IMAGE CONTAINER
  const handleToggleTraitForImage = (imageIndex: number, traitId: string) => {
    setImageTraitsMap((prev) => {
      const list = prev[imageIndex] || baseTraits.map((t) => ({ ...t }));
      const updated = list.map((t) => (t.id === traitId ? { ...t, enabled: !t.enabled } : t));
      return {
        ...prev,
        [imageIndex]: updated,
      };
    });
  };

  // 4. REMOVE TRAIT FOR SPECIFIC IMAGE CONTAINER
  const handleRemoveTraitForImage = (imageIndex: number, traitId: string) => {
    setImageTraitsMap((prev) => {
      const list = prev[imageIndex] || [];
      return {
        ...prev,
        [imageIndex]: list.filter((t) => t.id !== traitId),
      };
    });
  };

  // 5. ADD TRAIT FROM COMMUNITY SUGGESTION
  const handleAddTraitFromSuggestion = (suggestion: TraitSuggestion) => {
    const targetIndex = 0; // Or current selected
    const newTrait: Trait = {
      id: `sug_${Date.now()}`,
      name: suggestion.name,
      isBeauty: suggestion.isBeauty,
      enabled: true,
      creatorName: suggestion.creatorName,
    };

    setImageTraitsMap((prev) => {
      const list = (prev[targetIndex] || []).map((t) => ({ ...t }));
      if (!list.some((t) => t.name.toLowerCase() === suggestion.name.toLowerCase())) {
        list.push(newTrait);
      } else {
        list.forEach((t) => {
          if (t.name.toLowerCase() === suggestion.name.toLowerCase()) t.enabled = true;
        });
      }
      return {
        ...prev,
        [targetIndex]: list,
      };
    });
  };

  // 6. CREATE CUSTOM TRAIT (SAVES TO SUPABASE CUSTOM_TRAITS)
  const handleAddCustomTrait = async (name: String, isBeauty: boolean) => {
    const traitName = String(name).trim().toLowerCase();
    const newTrait: Trait = {
      id: `custom_${Date.now()}`,
      name: traitName,
      isBeauty,
      enabled: true,
      creatorName: 'Você',
    };

    // Add to all containers or current container
    setImageTraitsMap((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        const idx = Number(key);
        updated[idx] = [...updated[idx], { ...newTrait }];
      });
      return updated;
    });

    // Add to community suggestions ticker
    const newSug: TraitSuggestion = {
      id: `sug_${Date.now()}`,
      name: traitName,
      isBeauty,
      creatorName: 'Você',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop',
      usageCount: 1,
    };
    setTraitSuggestions((prev) => [newSug, ...prev]);

    // Persist to Supabase custom_traits table
    try {
      await supabase.from('custom_traits').insert({
        name: traitName,
        is_beauty: isBeauty,
        creator_name: 'Você',
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase custom trait persist fallback:', err);
    }
  };

  // Generate with AI handler
  const saveGeneratedPost = async (post: typeof resultData) => {
    setIsPublishing(true);
    setPublishError('');
    setPublishStatus('publishing');

    try {
      const imageUrls: string[] = [];
      for (let index = 0; index < post.images.length; index++) {
        const response = await fetch(post.images[index]);
        if (!response.ok) {
          throw new Error(`Não foi possível preparar a imagem ${index + 1} para publicação.`);
        }
        const imageBlob = await response.blob();
        const extension =
          imageBlob.type === 'image/jpeg' ? 'jpg' :
          imageBlob.type === 'image/webp' ? 'webp' :
          imageBlob.type === 'image/png' ? 'png' : null;
        if (!extension) {
          throw new Error(`A imagem ${index + 1} está em um formato não suportado.`);
        }

        const path = `posts/${post.postId}/${index + 1}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from('naverdade-images')
          .upload(path, imageBlob, {
            cacheControl: '3600',
            contentType: imageBlob.type,
            upsert: true,
          });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('naverdade-images')
          .getPublicUrl(path);
        imageUrls.push(publicUrlData.publicUrl);
      }

      const authorName = currentUser?.displayName || 'Criador Visitante';
      const authorHandle = currentUser
        ? `@${currentUser.email.split('@')[0]}`
        : '@criador.naverdade';
      const { error: postError } = await supabase.from('posts').upsert(
        {
          id: post.postId,
          author_name: authorName,
          author_handle: authorHandle,
          caption: post.tiktokTitle,
          tiktok_title: post.tiktokTitle,
          step_captions: post.captions,
          images_urls: imageUrls,
          likes_count: 0,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (postError) throw postError;
      setPublishStatus('published');
    } catch (error) {
      console.error('Não foi possível publicar o post no feed:', error);
      setPublishStatus('error');
      setPublishError(
        error instanceof Error
          ? error.message
          : 'Não foi possível publicar no feed. Tente novamente.'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRetryPublish = () => {
    if (resultData.postId) void saveGeneratedPost(resultData);
  };

  const handleGeneratePost = async (data: {
    postType: 'UGLY_TO_BEAUTIFUL' | 'BEAUTIFUL_TO_UGLY';
    captions: string[];
    userPhotoUrl?: string;
    qwenImagesBySlot: Record<number, string>;
    cloudflareImagesBySlot: Record<number, string>;
  }, onProgress: (completed: number, total: number) => void) => {
    if (!data.userPhotoUrl) {
      throw new Error('Envie sua foto para gerar versões com IA.');
    }

    const imagesToUse: string[] = [];
    const imageSources: Array<'fooocus' | 'comfyui' | 'qwen' | 'cloudflare' | 'original'> = [];
    let generatedBackend: 'fooocus' | 'comfyui' | null = null;
    
    for (let index = 0; index < containersCount - 1; index++) {
      const qwenImage = data.qwenImagesBySlot[index];
      if (qwenImage) {
        imagesToUse.push(qwenImage);
        imageSources.push('qwen');
        onProgress(imagesToUse.length, containersCount - 1);
        continue;
      }

      const cloudflareImage = data.cloudflareImagesBySlot[index];
      if (cloudflareImage) {
        imagesToUse.push(cloudflareImage);
        imageSources.push('cloudflare');
        onProgress(imagesToUse.length, containersCount - 1);
        continue;
      }

      const activeTraits = (imageTraitsMap[index] || [])
        .filter((trait) => trait.enabled)
        .map((trait) => trait.name);
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: data.userPhotoUrl,
          postType: data.postType,
          traits: activeTraits,
        }),
      });
      const result: { image?: unknown; error?: unknown; backend?: unknown } = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof result.error === 'string'
            ? result.error
            : 'Não foi possível gerar as imagens.'
        );
      }
      if (typeof result.image !== 'string' || !/^data:image\/(?:jpeg|png|webp);base64,/.test(result.image)) {
        throw new Error(`O serviço não retornou uma imagem válida para a foto ${index + 1}.`);
      }
      if (result.backend !== 'fooocus' && result.backend !== 'comfyui') {
        throw new Error('O servidor não identificou qual serviço gerou a imagem.');
      }
      if (generatedBackend && generatedBackend !== result.backend) {
        throw new Error('O backend de geração mudou durante o processamento.');
      }
      generatedBackend = result.backend;
      imagesToUse.push(result.image);
      imageSources.push(result.backend);
      onProgress(imagesToUse.length, containersCount - 1);
    }
    imagesToUse.push(data.userPhotoUrl);
    imageSources.push('original');

    const generatedPost = {
      postId: crypto.randomUUID(),
      images: imagesToUse.slice(0, data.captions.length),
      captions: data.captions,
      sources: imageSources.slice(0, data.captions.length),
      tiktokTitle:
        data.postType === 'UGLY_TO_BEAUTIFUL'
          ? 'POV: O glow up da trend "Na Verdade" chocou todo mundo 😱 #naverdade #glowup'
          : 'POV: A ilusão da internet quando você descobre a verdade 😂 #naverdade #trend',
    };
    setResultData(generatedPost);
    setPublishStatus('publishing');
    setPublishError('');
    setShowResults(true);
    setPostsCreated((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await saveGeneratedPost(generatedPost);
  };

  // Email subscribe
  const handleSubscribeEmail = async (email: string) => {
    try {
      await supabase.from('subscribers').insert({
        email,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase subscriber sync fallback:', err);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions((prev) =>
        prev.map((a) => ({
          ...a,
          remainingSeconds: Math.max(0, a.remainingSeconds - 1),
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live viewer pulse effect
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveUsers((prev) => Math.max(1100, prev + Math.floor(Math.random() * 5) - 2));
      setLiveViewers((prev) => Math.max(800, prev + Math.floor(Math.random() * 7) - 3));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const homeAuction = auctions.find((a) => a.id === 'banner_home') || auctions[0];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Header */}
      <TopHeader liveUsers={liveUsers} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto bg-white shadow-xs">
        {showResults ? (
          <ResultsView
            resultData={resultData}
            publishStatus={publishStatus}
            publishError={publishError}
            isPublishing={isPublishing}
            onRetryPublish={handleRetryPublish}
            onBack={() => setShowResults(false)}
            onPublish={() => {
              setShowResults(false);
              setCurrentTab('feed');
            }}
            onOpenBid={handleOpenBid}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <LandingView
                onCreateClick={() => handleSelectTab('create')}
                onOpenBid={handleOpenBid}
                homeBid={homeAuction.currentBid}
                homeCountdown={homeAuction.remainingSeconds}
                onSubscribe={handleSubscribeEmail}
              />
            )}

            {currentTab === 'create' && (
              <CreatePostView
                imageTraitsMap={imageTraitsMap}
                onToggleTraitForImage={handleToggleTraitForImage}
                onRemoveTraitForImage={handleRemoveTraitForImage}
                onOpenAddTrait={() => setIsAddTraitOpen(true)}
                onAddTraitFromSuggestion={handleAddTraitFromSuggestion}
                traitSuggestions={traitSuggestions}
                containersCount={containersCount}
                onAddContainer={handleAddContainer}
                onRemoveContainer={handleRemoveContainer}
                userPhoto={userPhoto}
                onUploadUserPhoto={(url) => setUserPhoto(url)}
                qwenImagesBySlot={qwenImagesBySlot}
                onAcceptQwenImage={handleAcceptQwenImage}
                onRemoveQwenImage={handleRemoveQwenImage}
                cloudflareImagesBySlot={cloudflareImagesBySlot}
                onAcceptCloudflareImage={handleAcceptCloudflareImage}
                onRemoveCloudflareImage={handleRemoveCloudflareImage}
                onOpenBid={handleOpenBid}
                onGenerate={handleGeneratePost}
              />
            )}

            {currentTab === 'auctions' && (
              <AuctionView
                auctions={auctions}
                onOpenBid={handleOpenBid}
                activeUsers={liveUsers}
                liveViewers={liveViewers}
                postsCreated={postsCreated}
              />
            )}

            {currentTab === 'qwen' && (
              <QwenView />
            )}

            {currentTab === 'feed' && (
              <FeedView
                onOpenBid={handleOpenBid}
                onCreateClick={() => handleSelectTab('create')}
                currentUser={currentUser}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileView
                onCreateClick={() => handleSelectTab('create')}
                onAuctionClick={() => handleSelectTab('auctions')}
                currentUser={currentUser}
                onAvatarChange={(avatarUrl) =>
                  setCurrentUser((user) => (user ? { ...user, avatarUrl } : user))
                }
              />
            )}
          </>
        )}
      </main>

      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        avatarUrl={currentUser?.avatarUrl}
      />

      {/* Bid Modal */}
      {activeBidAuction && (
        <BidModal
          auction={activeBidAuction}
          onClose={() => setActiveBidAuction(null)}
          onSubmit={handleSubmitBid}
        />
      )}

      {/* Add Trait Modal */}
      {isAddTraitOpen && (
        <AddTraitModal
          onClose={() => setIsAddTraitOpen(false)}
          onAdd={handleAddCustomTrait}
        />
      )}
    </div>
  );
}
