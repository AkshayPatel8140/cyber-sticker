'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { User, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/hooks/useUserProfile';

interface EditProfileProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  profile: UserProfile | null;
  onCancel: () => void;
  onSave: () => void | Promise<void>;
}

export default function EditProfile({ user, profile, onCancel, onSave }: EditProfileProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || user.name || '');
  const [title, setTitle] = useState(profile?.title || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatar, setAvatar] = useState(profile?.avatar_url || user.image || '');
  const [socialLinks, setSocialLinks] = useState<string[]>(profile?.social_links || []);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user.id) return;

    setIsSaving(true);
    try {
      const payload = {
        user_id: user.id,
        email: user.email ?? null,
        display_name: displayName || null,
        title: title || null,
        bio: bio || null,
        avatar_url: avatar || null,
        social_links: socialLinks,
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. Please try again.');
        return;
      }

      await onSave();
    } catch (err) {
      console.error('Unexpected error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addSocialLink = () => {
    if (socialLinks.length < 5) {
      setSocialLinks([...socialLinks, '']);
    }
  };

  const updateSocialLink = (index: number, value: string) => {
    const updated = [...socialLinks];
    updated[index] = value;
    setSocialLinks(updated);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
        <button
          onClick={onCancel}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Avatar */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Avatar
        </label>
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
            >
              Change Avatar
            </button>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG, or WebP. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
          placeholder="Enter your display name"
        />
        <p className="text-xs text-gray-500 mt-1">
          {displayName.length}/50 characters
        </p>
      </div>

      {/* Title/Tagline */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title/Tagline
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
          placeholder="Creating unique visuals with AI"
        />
        <p className="text-xs text-gray-500 mt-1">
          {title.length}/100 characters
        </p>
      </div>

      {/* Bio */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-y"
          placeholder="Tell visitors about yourself..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {bio.length}/500 characters
        </p>
      </div>

      {/* Social Links */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Social Links
          </label>
          {socialLinks.length < 5 && (
            <button
              onClick={addSocialLink}
              className="text-sm text-gray-700 hover:text-gray-900 font-medium"
            >
              + Add Link
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Add up to 5 social media links. They&apos;ll be displayed on your creator profile.
        </p>
        <div className="space-y-2">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="url"
                value={link}
                onChange={(e) => updateSocialLink(index, e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                placeholder="https://..."
              />
              <button
                onClick={() => removeSocialLink(index)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Remove link"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <motion.button
          onClick={handleSave}
          whileHover={!isSaving ? { scale: 1.02 } : {}}
          whileTap={!isSaving ? { scale: 0.98 } : {}}
          disabled={isSaving}
          className="flex-1 py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </motion.button>
        <motion.button
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
        >
          Cancel
        </motion.button>
      </div>
    </motion.div>
  );
}
