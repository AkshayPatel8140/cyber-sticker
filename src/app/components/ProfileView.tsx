'use client';

import { motion } from 'framer-motion';
import { User, Heart, Edit, ExternalLink, Plus, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ProfileViewProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onEdit: () => void;
}

export default function ProfileView({ user, onEdit }: ProfileViewProps) {
  const router = useRouter();
  
  // Mock data - in a real app, this would come from a database
  const memberSince = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const totalLikes = 0; // This would come from your database

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      {/* Signed In As Section */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || 'User'}
            className="w-16 h-16 rounded-full border-2 border-gray-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {user.name || 'User'}
          </h2>
          <p className="text-sm text-gray-600">
            {user.email}
          </p>
        </div>
      </div>

      {/* Member Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Member Since:</span>
          <span className="text-sm font-medium text-gray-900">{memberSince}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Last Update:</span>
          <span className="text-sm font-medium text-gray-900">—</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="text-sm text-gray-600">Total Likes</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{totalLikes}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <motion.button
          onClick={onEdit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 min-w-[140px] py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </motion.button>
        
        <motion.button
          onClick={() => router.push(`/user/${user.id}`)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 min-w-[140px] py-2.5 px-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View Public Profile
        </motion.button>
        
        <motion.button
          onClick={() => router.push('/submit')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 min-w-[140px] py-2.5 px-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Submit new prompt
        </motion.button>
      </div>
      
      {/* Sign Out Button - Separate Row */}
      <div className="pt-2">
        <button
          onClick={() => signOut({ callbackUrl: '/signin' })}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Sign out
        </button>
      </div>
    </motion.div>
  );
}
