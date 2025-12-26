import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { getStickerById } from '@/lib/api/stickers';
import type { Sticker } from '@/lib/api/stickers';
import { getStickerImageUrl } from '@/lib/image-url';
import { auth } from '@/auth';
import { getUserSubscriptionPlan } from '@/lib/api/subscriptions';
import Navbar from '../../components/Navbar';
import CopyPromptButton from './CopyPromptButton';
import LikeButton from './LikeButton';

export default async function StickerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sticker = await getStickerById(id);

  if (!sticker) {
    notFound();
  }

  // Get user session and subscription
  const session = await auth();
  let userPlan: 'free' | 'pro' | 'studio' = 'free';
  if (session?.user?.id) {
    userPlan = await getUserSubscriptionPlan(session.user.id);
  }

  // Check if user can access premium content
  const canAccessPremium = userPlan === 'pro' || userPlan === 'studio';
  const isPremium = sticker.is_premium || false;
  const showPremiumContent = isPremium && !canAccessPremium;

  // Format the publish date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to gallery</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column: Sticker Image */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-2xl aspect-square">
                <Image
                  src={getStickerImageUrl(sticker.image_url)}
                  alt={sticker.title}
                  fill
                  className="object-contain rounded-2xl shadow-2xl"
                  priority
                  draggable={false}
                />
                {/* Premium Badge */}
                {isPremium && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-900/80 backdrop-blur-sm rounded-full">
                      <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-white uppercase tracking-wide leading-none">
                        Premium
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Sticker Details */}
            <div className="flex flex-col justify-start space-y-6">
              {/* Title and Like Button */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-4xl font-bold text-gray-900 flex-1">
                    {sticker.title}
                  </h1>
                  <LikeButton
                    stickerId={sticker.id}
                    initialLikes={sticker.likes || 0}
                  />
                </div>
                <p className="text-gray-500">
                  {formatDate(sticker.publish_date)}
                </p>
              </div>

              {/* Premium Content Box or Regular Prompt Box */}
              {showPremiumContent ? (
                <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6 shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <Lock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <h2 className="text-sm font-semibold text-amber-900 mb-2">
                        Premium Content
                      </h2>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        This prompt is exclusive to subscribers. Subscribe to any plan to unlock all premium prompts and access the Studio.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                  >
                    View subscription plans
                  </Link>
                </div>
              ) : (
                <>
                  {/* Prompt Box */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Prompt
                      </h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {sticker.prompt}
                    </p>
                    <div className="flex justify-end">
                      <CopyPromptButton prompt={sticker.prompt} />
                    </div>
                  </div>

                  {/* Remix Idea Section */}
                  {sticker.remix_idea && (
                    <div className="bg-purple-50 rounded-xl border-2 border-purple-200 p-6 shadow-sm">
                      <h2 className="text-sm font-semibold text-purple-900 mb-3">
                        🎨 Remix This Design:
                      </h2>
                      <p className="text-purple-800 leading-relaxed">
                        {sticker.remix_idea}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

