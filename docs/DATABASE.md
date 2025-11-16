# Database Schema Documentation

This document describes the database schema for the Henlo marketplace platform, built on PostgreSQL via Supabase.

## Overview

The database is designed to support a full-featured marketplace with:
- User authentication and profiles
- Product listings with categories
- Real-time messaging
- Favorites/bookmarks
- Reviews and ratings
- Payment transactions

All tables use Row Level Security (RLS) to ensure data privacy and security.

## Database Tables

### 1. profiles

Extends Supabase's `auth.users` table to store additional user information.

**Table Structure:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User ID (matches auth.users) |
| `username` | TEXT | UNIQUE, NOT NULL | Unique username for the user |
| `full_name` | TEXT | | User's full name |
| `avatar_url` | TEXT | | URL to user's avatar image |
| `bio` | TEXT | | User biography/description |
| `location` | TEXT | | User's location (city/region) |
| `phone` | TEXT | | User's phone number |
| `rating` | DECIMAL(2,1) | DEFAULT 0.0, CHECK (rating >= 0 AND rating <= 5) | Average user rating (0.0-5.0) |
| `total_reviews` | INTEGER | DEFAULT 0 | Total number of reviews received |
| `total_sales` | INTEGER | DEFAULT 0 | Total number of completed sales |
| `verified` | BOOLEAN | DEFAULT false | Whether user is verified |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Relationships:**
- One-to-many with `listings` (as seller)
- One-to-many with `favorites`
- One-to-many with `conversations` (as buyer or seller)
- One-to-many with `messages`
- One-to-many with `reviews` (as reviewer and reviewee)

**RLS Policies:**
- Public read access to all profiles
- Users can update only their own profile
- Automatic profile creation on user signup (trigger)

**Triggers:**
- `on_auth_user_created`: Automatically creates a profile when a new user signs up

---

### 2. categories

Hierarchical category system for organizing listings.

**Table Structure:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Category ID |
| `name` | TEXT | NOT NULL | Category name (e.g., "Elektronica") |
| `slug` | TEXT | UNIQUE, NOT NULL | URL-friendly slug (e.g., "elektronica") |
| `icon` | TEXT | | Icon name (Lucide React icon) |
| `parent_id` | UUID | REFERENCES categories(id) | Parent category (for subcategories) |
| `order` | INTEGER | DEFAULT 0 | Display order |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |

**Relationships:**
- Self-referential: Categories can have parent categories (hierarchical)
- One-to-many with `listings`

**Hierarchy Example:**
```
Elektronica (parent)
├── Telefoons (child)
├── Computers (child)
└── Audio (child)

Kleding (parent)
├── Dames (child)
└── Heren (child)
```

**RLS Policies:**
- Public read access to all categories
- Only admins can insert/update/delete categories

---

### 3. listings

Product listings created by sellers.

**Table Structure:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Listing ID |
| `seller_id` | UUID | REFERENCES profiles(id) ON DELETE CASCADE | Seller's user ID |
| `category_id` | UUID | REFERENCES categories(id) | Category ID |
| `title` | TEXT | NOT NULL | Listing title |
| `description` | TEXT | NOT NULL | Listing description |
| `price` | DECIMAL(10,2) | NOT NULL, CHECK (price >= 0) | Price in EUR |
| `condition` | TEXT | NOT NULL | Condition: 'new', 'as_new', 'good', 'fair', 'poor' |
| `images` | TEXT[] | DEFAULT '{}' | Array of image URLs (max 8) |
| `primary_image` | TEXT | | Main image URL (first image) |
| `location` | TEXT | NOT NULL | Location (city/region) |
| `postal_code` | TEXT | | Postal code |
| `shipping_available` | BOOLEAN | DEFAULT false | Whether shipping is available |
| `pickup_available` | BOOLEAN | DEFAULT true | Whether pickup is available |
| `shipping_cost` | DECIMAL(10,2) | DEFAULT 0, CHECK (shipping_cost >= 0) | Shipping cost in EUR |
| `status` | TEXT | DEFAULT 'active' | Status: 'draft', 'active', 'sold', 'reserved', 'expired', 'removed' |
| `slug` | TEXT | UNIQUE, NOT NULL | URL-friendly slug (auto-generated) |
| `views` | INTEGER | DEFAULT 0 | View count |
| `favorites_count` | INTEGER | DEFAULT 0 | Number of users who favorited |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Relationships:**
- Many-to-one with `profiles` (seller)
- Many-to-one with `categories`
- One-to-many with `favorites`
- One-to-many with `conversations`
- One-to-many with `reviews`
- One-to-many with `payments`

**Indexes:**
- `idx_listings_seller` on `seller_id`
- `idx_listings_category` on `category_id`
- `idx_listings_status` on `status`
- Full-text search index on `title` and `description`

**RLS Policies:**
- Public read access to active listings
- Sellers can view all their own listings (including drafts)
- Sellers can create, update, and delete their own listings
- Listings are soft-deleted (status changed to 'removed')

**Triggers:**
- `update_updated_at`: Updates `updated_at` on every modification
- `generate_listing_slug`: Auto-generates slug from title

---

### 4. favorites

Stores user favorites/bookmarks of listings.

**Table Structure:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Favorite ID |
| `user_id` | UUID | REFERENCES profiles(id) ON DELETE CASCADE | User who favorited |
| `listing_id` | UUID | REFERENCES listings(id) ON DELETE CASCADE | Favorited listing |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | When favorited |

**Constraints:**
- `UNIQUE(user_id, listing_id)`: A user can favorite a listing only once

**Relationships:**
- Many-to-one with `profiles`
- Many-to-one with `listings`

**RLS Policies:**
- Users can view only their own favorites
- Users can create and delete their own favorites

**Triggers:**
- `update_listing_favorites_count`: Updates `listings.favorites_count` when favorite is added/removed

---

### 5. conversations

Messaging conversations between buyers and sellers about a specific listing.

**Table Structure:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Conversation ID |
| `listing_id` | UUID | REFERENCES listings(id) ON DELETE CASCADE | Related listing |
| `buyer_id` | UUID | REFERENCES profiles(id) ON DELETE CASCADE | Buyer user ID |
| `seller_id` | UUID | REFERENCES profiles(id) ON DELETE CASCADE | Seller user ID |
| `last_message_at` | TIMESTAMPTZ | DEFAULT now() | Timestamp of last message |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Conversation start timestamp |

**Constraints:**
- `UNIQUE(listing_id, buyer_id)`: Only one conversation per listing-buyer pair

**Relationships:**
- Many-to-one with `listings`
- Many-to-one with `profiles` (buyer)
- Many-to-one with `profiles` (seller)
- One-to-many with `messages`

**RLS Policies:**
- Buyers and sellers can view their own conversations
- Buyers can create new conversations
- `last_message_at` updated automatically via trigger

**Triggers:**
- `update_conversation_timestamp`: Updates `last_message_at` when new message is sent

---

### 6. messages

Individual messages within conversations.

**Table Structure:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Message ID |
| `conversation_id` | UUID | REFERENCES conversations(id) ON DELETE CASCADE | Parent conversation |
| `sender_id` | UUID | REFERENCES profiles(id) ON DELETE CASCADE | Message sender |
| `content` | TEXT | NOT NULL | Message content |
| `read` | BOOLEAN | DEFAULT false | Whether message has been read |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Message timestamp |

**Relationships:**
- Many-to-one with `conversations`
- Many-to-one with `profiles` (sender)

**RLS Policies:**
- Participants can view messages in their conversations
- Participants can send messages in their conversations
- Participants can mark messages as read

**Real-time Subscriptions:**
- Enabled for real-time messaging functionality
- Clients subscribe to messages in their conversations

---

### 7. reviews

Reviews and ratings for completed transactions.

**Table Structure:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Review ID |
| `listing_id` | UUID | REFERENCES listings(id) ON DELETE CASCADE | Reviewed listing |
| `reviewer_id` | UUID | REFERENCES profiles(id) ON DELETE CASCADE | User who wrote review |
| `reviewee_id` | UUID | REFERENCES profiles(id) ON DELETE CASCADE | User being reviewed |
| `rating` | INTEGER | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Star rating (1-5) |
| `comment` | TEXT | | Review comment/text |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Review timestamp |

**Constraints:**
- `UNIQUE(listing_id, reviewer_id)`: One review per listing per user

**Relationships:**
- Many-to-one with `listings`
- Many-to-one with `profiles` (reviewer)
- Many-to-one with `profiles` (reviewee - typically the seller)

**RLS Policies:**
- Public read access to all reviews
- Only transaction participants can create reviews
- Reviews cannot be deleted (only hidden by admins if needed)

**Triggers:**
- `update_user_rating`: Recalculates `profiles.rating` and `total_reviews` when review is added/updated

---

### 8. payments

Payment transaction records for Mollie integration.

**Table Structure:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Payment record ID |
| `mollie_payment_id` | TEXT | UNIQUE, NOT NULL | Mollie payment ID |
| `listing_id` | UUID | REFERENCES listings(id) ON DELETE SET NULL | Related listing |
| `buyer_id` | UUID | REFERENCES profiles(id) ON DELETE SET NULL | Buyer user ID |
| `seller_id` | UUID | REFERENCES profiles(id) ON DELETE SET NULL | Seller user ID |
| `amount` | DECIMAL(10,2) | NOT NULL | Payment amount in EUR |
| `status` | TEXT | DEFAULT 'pending' | Status: 'pending', 'paid', 'failed', 'canceled', 'expired' |
| `checkout_url` | TEXT | | Mollie checkout URL |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Payment creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Relationships:**
- Many-to-one with `listings`
- Many-to-one with `profiles` (buyer)
- Many-to-one with `profiles` (seller)

**RLS Policies:**
- Buyers and sellers can view their own payment records
- System can create and update payment records (via API)

**Webhook Integration:**
- Mollie webhooks update payment status
- When status becomes 'paid', listing status updates to 'sold'

---

## Relationships Diagram

```
┌──────────────┐
│  auth.users  │
└──────┬───────┘
       │
       │ 1:1
       ▼
┌──────────────┐
│   profiles   │◄────────┐
└──────┬───────┘         │
       │                 │
       │ 1:N             │ N:1
       ▼                 │
┌──────────────┐    ┌────┴──────┐
│   listings   │◄───│categories │
└──────┬───────┘    └───────────┘
       │
       ├─────────────┐
       │ 1:N         │ 1:N
       ▼             ▼
┌──────────────┐ ┌──────────────┐
│  favorites   │ │conversations │
└──────────────┘ └──────┬───────┘
                        │
                        │ 1:N
                        ▼
                 ┌──────────────┐
                 │   messages   │
                 └──────────────┘

       ┌──────────────┐
       │   listings   │
       └──────┬───────┘
              │
       ┌──────┼──────┐
       │ 1:N  │ 1:N  │ 1:N
       ▼      ▼      ▼
┌──────────┐ ┌────────┐ ┌──────────┐
│ reviews  │ │payments│ │favorites │
└──────────┘ └────────┘ └──────────┘
```

## Key Features

### Row Level Security (RLS)

All tables have RLS enabled to ensure data privacy:

- **profiles**: Public read, users can only update their own profile
- **listings**: Public read for active listings, sellers manage their own
- **favorites**: Users can only see and manage their own favorites
- **conversations**: Only participants can view conversation
- **messages**: Only conversation participants can view/send messages
- **reviews**: Public read, only participants can create reviews
- **payments**: Only buyer and seller can view payment records

### Full-Text Search

Listings table has full-text search enabled on:
- `title`
- `description`

This allows efficient searching across all listings.

### Indexes

Strategic indexes for performance:
- Foreign keys (seller_id, category_id, etc.)
- Status fields for filtering
- Created_at/updated_at for sorting
- Unique constraints on slugs and usernames

### Triggers

Automated database operations:
1. **Auto-create profile**: When user signs up in auth.users
2. **Update timestamps**: Auto-update `updated_at` fields
3. **Generate slugs**: Auto-generate URL-friendly slugs
4. **Update counters**: Update favorites_count, rating, total_reviews
5. **Update conversation**: Update last_message_at when message sent

## Data Validation

### Listing Status Flow

```
draft ──► active ──► sold
              │
              ├──► reserved ──► sold
              │
              ├──► expired
              │
              └──► removed
```

### Condition Values
- `new`: Brand new, never used
- `as_new`: Used but in perfect condition
- `good`: Used with minor signs of wear
- `fair`: Used with visible signs of wear
- `poor`: Used with significant wear

### Payment Status Flow

```
pending ──► paid ──► (listing marked as sold)
    │
    ├──► failed
    │
    ├──► canceled
    │
    └──► expired
```

## Storage

### Supabase Storage Buckets

**avatars bucket:**
- User profile avatars
- Public read access
- Authenticated write (users can upload their own)

**listing-images bucket:**
- Listing images (up to 8 per listing)
- Public read access
- Authenticated write (sellers can upload)
- 5MB max file size
- Formats: JPEG, PNG, WebP

## Migration Guide

To set up the database:

1. **Create Supabase project**
2. **Run migrations** in order:
   - Enable UUID extension
   - Create profiles table and trigger
   - Create categories table
   - Create listings table with indexes
   - Create favorites table with trigger
   - Create conversations table
   - Create messages table
   - Create reviews table with trigger
   - Create payments table
   - Set up RLS policies for all tables
   - Set up storage buckets

3. **Seed data**:
   - Insert default categories
   - (Optional) Insert test users and listings for development

Detailed SQL scripts can be found in `IMPLEMENTATIE_GIDS.md`.

## Backup and Recovery

**Supabase Automatic Backups:**
- Daily automatic backups (free tier: 7 days retention)
- Point-in-time recovery on paid plans
- Manual backups available via Supabase dashboard

**Manual Backup:**
```bash
# Using pg_dump (requires direct database access)
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried fields are indexed
2. **Pagination**: Implement pagination for listing queries (LIMIT/OFFSET)
3. **Caching**: Consider caching category data (rarely changes)
4. **Image Optimization**: Images served via Supabase CDN
5. **Real-time Subscriptions**: Only subscribe to necessary conversations/messages

## Security Best Practices

1. **Always use RLS**: Never disable Row Level Security
2. **Service Role Key**: Only use server-side in API routes, never expose to client
3. **Input Validation**: Validate all inputs before database operations
4. **SQL Injection**: Use parameterized queries (Supabase client handles this)
5. **File Upload**: Validate file types and sizes before storage
6. **Rate Limiting**: Implement rate limiting on API routes
7. **HTTPS Only**: All connections encrypted via HTTPS

## Common Queries

### Get listings with seller info and category
```sql
SELECT
  listings.*,
  profiles.username,
  profiles.avatar_url,
  profiles.rating,
  categories.name as category_name
FROM listings
LEFT JOIN profiles ON listings.seller_id = profiles.id
LEFT JOIN categories ON listings.category_id = categories.id
WHERE listings.status = 'active'
ORDER BY listings.created_at DESC;
```

### Get user's conversations with unread count
```sql
SELECT
  conversations.*,
  COUNT(messages.id) FILTER (WHERE messages.read = false AND messages.sender_id != $user_id) as unread_count
FROM conversations
LEFT JOIN messages ON messages.conversation_id = conversations.id
WHERE conversations.buyer_id = $user_id OR conversations.seller_id = $user_id
GROUP BY conversations.id
ORDER BY conversations.last_message_at DESC;
```

### Calculate user rating
```sql
SELECT
  AVG(rating) as average_rating,
  COUNT(*) as total_reviews
FROM reviews
WHERE reviewee_id = $user_id;
```

## Future Enhancements

Potential schema additions:
- **Notifications table**: For push notifications
- **Reports table**: For reporting inappropriate content
- **Saved searches**: Save search criteria
- **Shipping addresses**: Store multiple addresses per user
- **Order history**: Detailed transaction records
- **Admin logs**: Audit trail for admin actions
