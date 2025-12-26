# Supabase API Inventory

This document lists all Supabase API calls currently in the codebase that need to be centralized.

## ✅ Already Centralized
- **Like API** - `src/hooks/useLike.ts` (toggle_likes RPC + fallback UPDATE)
- **Sticker APIs** - `src/lib/api/stickers.ts` ✅ **COMPLETED**
  - `getTodaySticker()` - Fetches latest sticker where publish_date <= today
  - `getAllStickers()` - Fetches all stickers ordered by publish_date DESC
  - `getStickerById(id: string)` - Fetches a single sticker by ID
- **User Profile APIs** - `src/lib/api/profiles.ts` ✅ **COMPLETED**
  - `getUserProfile(userId)` - Fetches user profile by user_id
  - `upsertUserProfile(userId, profileData)` - Creates/updates user profile

---

## 📋 APIs to Centralize

### 2. **User Profile APIs** (Table: `user_profiles`) ✅ **COMPLETED**
   - **Location**: `src/lib/api/profiles.ts`
   - **Functions**:
     - `getUserProfile(userId)` ✅ - Fetches user profile by user_id
     - `upsertUserProfile(userId, profileData)` ✅ - Creates/updates user profile
   
   **Implementation**:
   - ✅ Centralized in `src/lib/api/profiles.ts`
   - ✅ Used by `src/hooks/useUserProfile.ts` (getUserProfile)
   - ✅ Used by `src/app/components/EditProfile.tsx` (upsertUserProfile)
   - ✅ Used by `src/auth.ts` (upsertUserProfile)

---

### 2. **User Profile APIs** (Table: `user_profiles`)
   - **Location**: `src/hooks/useUserProfile.ts`
   - **Functions**:
     - `loadProfile()` - Fetches user profile by user_id
   
   - **Location**: `src/app/components/EditProfile.tsx`
   - **Functions**:
     - `handleSave()` - Upserts user profile data
   
   - **Location**: `src/auth.ts`
   - **Functions**:
     - JWT callback - Upserts user profile during authentication

   **Current Implementation**:
   - Partially in hook (`useUserProfile`)
   - Save/update logic in component
   - Auth sync logic in auth.ts
   - Needs consolidation

---

### 3. **Subscription APIs** (Table: `user_subscriptions`)
   - **Location**: `src/lib/subscription.ts`
   - **Functions**:
     - `getUserSubscriptionPlan(userId: string)` - Gets user's subscription plan
     - `setUserSubscriptionPlan(userId: string, plan: SubscriptionPlan)` - Sets/updates subscription plan
     - `initializeUserSubscription(userId: string)` - Initializes subscription for new user
     - `canAccessPlan(userPlan, targetPlan)` - Utility function (no API call)
     - `isCurrentOrIncludedPlan(userPlan, targetPlan)` - Utility function (no API call)

   **Current Implementation**:
   - Already in `src/lib/subscription.ts` (good structure)
   - Could be moved to hooks pattern for consistency
   - Already centralized but not following hooks pattern

---

## 📊 Summary by Table

| Table | Operations | Current Status | Priority |
|-------|-----------|----------------|----------|
| `stickers` | SELECT (3 functions) | ✅ Centralized (`src/lib/api/stickers.ts`) | ✅ Done |
| `user_profiles` | SELECT, UPSERT (2 functions) | ✅ Centralized (`src/lib/api/profiles.ts`) | ✅ Done |
| `user_subscriptions` | SELECT, INSERT, UPDATE (3 functions) | ✅ Centralized (`src/lib/api/subscriptions.ts`) | ✅ Done |
| RPC: `toggle_likes` | RPC call | ✅ Centralized (`src/hooks/useLike.ts`) | ✅ Done |

---

## 🎯 Recommended Centralization Structure

### Option 1: Service Functions (Current subscription.ts pattern) ✅ IMPLEMENTED
```
src/lib/api/
  ├── stickers.ts      ✅ (getTodaySticker, getAllStickers, getStickerById) - COMPLETED
  ├── profiles.ts       ✅ (getUserProfile, upsertUserProfile) - COMPLETED
  └── subscriptions.ts ✅ (getUserSubscriptionPlan, setUserSubscriptionPlan, initializeUserSubscription) - COMPLETED
```

### Option 2: Custom Hooks (Like useLike pattern)
```
src/hooks/
  ├── useLike.ts          (✅ done)
  ├── useStickers.ts      (getTodaySticker, getAllStickers, getStickerById)
  ├── useUserProfile.ts   (✅ exists, needs update/upsert methods)
  └── useSubscription.ts  (convert from lib to hook)
```

### Option 3: Hybrid Approach (Recommended)
```
src/lib/api/              (Server-side functions)
  ├── stickers.ts
  ├── profiles.ts
  └── subscriptions.ts

src/hooks/                (Client-side hooks)
  ├── useLike.ts
  ├── useStickers.ts      (client-side sticker operations)
  ├── useUserProfile.ts   (enhanced)
  └── useSubscription.ts  (client-side subscription operations)
```

---

## 📝 Detailed Function List

### Stickers API ✅ COMPLETED
1. **getTodaySticker()** ✅
   - Type: Server-side function
   - Location: `src/lib/api/stickers.ts`
   - Query: `SELECT * FROM stickers WHERE publish_date <= today ORDER BY publish_date DESC, id DESC LIMIT 1`
   - Returns: `Sticker | null`
   - Used in: `src/app/page.tsx`

2. **getAllStickers()** ✅
   - Type: Server-side function
   - Location: `src/lib/api/stickers.ts`
   - Query: `SELECT * FROM stickers ORDER BY publish_date DESC`
   - Returns: `Sticker[]`
   - Used in: `src/app/page.tsx`

3. **getStickerById(id: string)** ✅
   - Type: Server-side function
   - Location: `src/lib/api/stickers.ts`
   - Query: `SELECT * FROM stickers WHERE id = ?`
   - Returns: `Sticker | null`
   - Used in: `src/app/sticker/[id]/page.tsx`

### User Profiles API ✅ COMPLETED
1. **getUserProfile(userId: string)** ✅
   - Type: Server/client-side function
   - Location: `src/lib/api/profiles.ts`
   - Query: `SELECT * FROM user_profiles WHERE user_id = ?`
   - Returns: `UserProfile | null`
   - Used in: `src/hooks/useUserProfile.ts`

2. **upsertUserProfile(userId: string, profileData: Partial<UserProfile>)** ✅
   - Type: Server/client-side function
   - Location: `src/lib/api/profiles.ts`
   - Query: `UPSERT INTO user_profiles ... ON CONFLICT user_id`
   - Returns: `UserProfile | null`
   - Used in: `src/app/components/EditProfile.tsx`, `src/auth.ts`

### Subscriptions API ✅ COMPLETED
1. **getUserSubscriptionPlan(userId: string)** ✅
   - Type: Server/client-side function
   - Location: `src/lib/api/subscriptions.ts`
   - Query: `SELECT plan FROM user_subscriptions WHERE user_id = ?`
   - Returns: `SubscriptionPlan`
   - Used in: `src/app/sticker/[id]/page.tsx`, `src/hooks/useSubscription.ts`

2. **setUserSubscriptionPlan(userId: string, plan: SubscriptionPlan)** ✅
   - Type: Server/client-side function
   - Location: `src/lib/api/subscriptions.ts`
   - Query: `INSERT/UPDATE user_subscriptions ...`
   - Returns: `void`
   - Used in: `src/hooks/useSubscription.ts`

3. **initializeUserSubscription(userId: string)** ✅
   - Type: Server/client-side function
   - Location: `src/lib/api/subscriptions.ts`
   - Query: `INSERT INTO user_subscriptions ... (if not exists)`
   - Returns: `SubscriptionPlan`
   - Used in: `src/hooks/useSubscription.ts`

4. **canAccessPlan(userPlan, targetPlan)** ✅
   - Type: Utility function (no API call)
   - Location: `src/lib/api/subscriptions.ts`
   - Returns: `boolean`

5. **isCurrentOrIncludedPlan(userPlan, targetPlan)** ✅
   - Type: Utility function (no API call)
   - Location: `src/lib/api/subscriptions.ts`
   - Returns: `boolean`
   - Used in: `src/app/pricing/page.tsx`

---

## 🚀 Next Steps

1. ✅ **Stickers API** - **COMPLETED** (all 3 functions centralized in `src/lib/api/stickers.ts`)
2. ✅ **User Profiles API** - **COMPLETED** (all 2 functions centralized in `src/lib/api/profiles.ts`)
3. ✅ **Subscriptions API** - **COMPLETED** (already centralized in `src/lib/subscription.ts`)
4. ✅ **Like API** - **COMPLETED** (centralized in `src/hooks/useLike.ts`)

## 🎉 All APIs Centralized!

All Supabase API calls have been successfully centralized into a consistent structure:
- **Stickers**: `src/lib/api/stickers.ts`
- **Profiles**: `src/lib/api/profiles.ts`
- **Subscriptions**: `src/lib/api/subscriptions.ts`
- **Likes**: `src/hooks/useLike.ts`

