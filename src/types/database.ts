/**
 * Database types
 *
 * This file will contain Supabase generated types.
 * Types will be generated after creating the database schema.
 *
 * To generate types, run:
 * npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          location: string | null
          bio: string | null
          member_since: string | null
          rating: number | null
          total_reviews: number | null
          total_sales: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          location?: string | null
          bio?: string | null
          member_since?: string | null
          rating?: number | null
          total_reviews?: number | null
          total_sales?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          location?: string | null
          bio?: string | null
          member_since?: string | null
          rating?: number | null
          total_reviews?: number | null
          total_sales?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          title: string
          slug: string
          description: string
          category: string
          price: number
          condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
          location: string
          primary_image: string | null
          images: string[]
          status: 'active' | 'sold' | 'inactive'
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          slug: string
          description: string
          category: string
          price: number
          condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
          location: string
          primary_image?: string | null
          images?: string[]
          status?: 'active' | 'sold' | 'inactive'
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          slug?: string
          description?: string
          category?: string
          price?: number
          condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
          location?: string
          primary_image?: string | null
          images?: string[]
          status?: 'active' | 'sold' | 'inactive'
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewee_id: string
          listing_id: string | null
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reviewer_id: string
          reviewee_id: string
          listing_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string
          reviewee_id?: string
          listing_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          created_at: string
          read: boolean
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
          read?: boolean
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          read?: boolean
        }
      }
      conversations: {
        Row: {
          id: string
          listing_id: string
          buyer_id: string
          seller_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          buyer_id: string
          seller_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          buyer_id?: string
          seller_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
