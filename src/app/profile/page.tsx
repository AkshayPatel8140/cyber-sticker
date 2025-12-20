'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProfileView from '../components/ProfileView';
import EditProfile from '../components/EditProfile';
import { useSubscription } from '@/hooks/useSubscription';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Account Settings
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Profile & Settings
            </h1>
            <p className="text-gray-600">
              Manage your account information, subscription, and appearance preferences.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {isEditing ? (
                <EditProfile 
                  user={session.user} 
                  onCancel={() => setIsEditing(false)}
                  onSave={() => setIsEditing(false)}
                />
              ) : (
                <ProfileView 
                  user={session.user} 
                  onEdit={() => setIsEditing(true)}
                />
              )}
            </div>

            {/* Right Column - Sidebar Cards */}
            <div className="space-y-6">
              <SubscriptionCard />
              <AppearanceCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subscription Card Component
function SubscriptionCard() {
  const router = useRouter();
  const { plan, isLoading } = useSubscription();
  
  const planNames: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    studio: 'Studio',
  };
  
  const planDescriptions: Record<string, string> = {
    free: 'You\'re on the free plan. Upgrade to unlock premium features.',
    pro: 'You\'re subscribed to Pro. Access all premium stickers and features.',
    studio: 'You\'re subscribed to Studio. Full access to all features and commercial license.',
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {plan === 'free' ? 'Current Plan' : 'Active Subscription'}
      </h3>
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-900 mb-1">
          {planNames[plan]} Plan
        </p>
        <p className="text-xs text-gray-600">
          {planDescriptions[plan]}
        </p>
      </div>
      <button 
        onClick={() => router.push('/pricing')}
        className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
      >
        {plan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
      </button>
    </div>
  );
}

// Appearance Card Component
function AppearanceCard() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Appearance
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            Currently using {isDark ? 'dark' : 'light'} mode.
          </p>
          <p className="text-xs text-gray-500">
            Theme preferences are stored per device. Switch anytime to preview how your stickers look in different palettes.
          </p>
        </div>
        <button
          onClick={() => setIsDark(!isDark)}
          className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
