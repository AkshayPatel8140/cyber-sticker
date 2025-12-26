'use client';

import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import ProfileMenu from './ProfileMenu';
import { useSubscription } from '@/hooks/useSubscription';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { plan } = useSubscription();
  
  // Show Subscribe button only if:
  // 1. Not on pricing page
  // 2. User has free plan (or not logged in)
  const showSubscribeButton = pathname !== '/pricing' && plan === 'free';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-3 py-4">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            // className="text-lg font-semibold text-gray-900 cursor-pointer"
            className="text-lg font-semibold text-gray-900 cursor-pointer flex items-center gap-1"
            onClick={() => router.push('/')}
          >
            <Image
              src="/logos/logo3.png"
              alt="CyberSticker Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            CyberSticker
          </motion.h1>
          
          <div className="flex items-center gap-6">
            {showSubscribeButton && (
              <motion.button
                onClick={() => router.push('/pricing')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Subscribe
              </motion.button>
            )}
            
            {session ? (
              <ProfileMenu />
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/signin')}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Sign in
              </motion.button>
            )}
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ opacity: 0.7 }}
              whileTap={{ scale: 0.98 }}
              className="sm:hidden text-gray-700"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
