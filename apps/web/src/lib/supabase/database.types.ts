export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          id: string
          user_id: string | null
          street: string
          city: string
          state: string
          zip_code: string
          country: string | null
          is_default: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          street: string
          city: string
          state: string
          zip_code: string
          country?: string | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          street?: string
          city?: string
          state?: string
          zip_code?: string
          country?: string | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: 'BUYER' | 'SELLER' | 'ADMIN'
          first_name: string | null
          last_name: string | null
          phone_number: string | null
          avatar_url: string | null
          email_verified: boolean | null
          mfa_enabled: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          role?: 'BUYER' | 'SELLER' | 'ADMIN'
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          email_verified?: boolean | null
          mfa_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: 'BUYER' | 'SELLER' | 'ADMIN'
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          email_verified?: boolean | null
          mfa_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      seller_profiles: {
        Row: {
          id: string
          user_id: string | null
          business_name: string
          description: string | null
          logo_url: string | null
          location: string | null
          certifications: string[] | null
          rating: number | null
          total_sales: number | null
          verified: boolean | null
          joined_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          business_name: string
          description?: string | null
          logo_url?: string | null
          location?: string | null
          certifications?: string[] | null
          rating?: number | null
          total_sales?: number | null
          verified?: boolean | null
          joined_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          business_name?: string
          description?: string | null
          logo_url?: string | null
          location?: string | null
          certifications?: string[] | null
          rating?: number | null
          total_sales?: number | null
          verified?: boolean | null
          joined_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          seller_id: string | null
          title: string
          description: string
          category: 'BEEF' | 'PORK' | 'CHICKEN' | 'LAMB' | 'SEAFOOD' | 'GAME' | 'OTHER'
          price: number
          unit: string
          images: string[] | null
          inventory: number | null
          status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
          specifications: Json | null
          sourcing_info: Json | null
          average_rating: number | null
          review_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          seller_id?: string | null
          title: string
          description: string
          category: 'BEEF' | 'PORK' | 'CHICKEN' | 'LAMB' | 'SEAFOOD' | 'GAME' | 'OTHER'
          price: number
          unit: string
          images?: string[] | null
          inventory?: number | null
          status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
          specifications?: Json | null
          sourcing_info?: Json | null
          average_rating?: number | null
          review_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          seller_id?: string | null
          title?: string
          description?: string
          category?: 'BEEF' | 'PORK' | 'CHICKEN' | 'LAMB' | 'SEAFOOD' | 'GAME' | 'OTHER'
          price?: number
          unit?: string
          images?: string[] | null
          inventory?: number | null
          status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
          specifications?: Json | null
          sourcing_info?: Json | null
          average_rating?: number | null
          review_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          buyer_id: string | null
          seller_id: string | null
          status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
          subtotal: number
          tax: number | null
          shipping: number | null
          total: number
          shipping_address_id: string | null
          payment_intent_id: string | null
          tracking_number: string | null
          estimated_delivery: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          buyer_id?: string | null
          seller_id?: string | null
          status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
          subtotal: number
          tax?: number | null
          shipping?: number | null
          total: number
          shipping_address_id?: string | null
          payment_intent_id?: string | null
          tracking_number?: string | null
          estimated_delivery?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          buyer_id?: string | null
          seller_id?: string | null
          status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
          subtotal?: number
          tax?: number | null
          shipping?: number | null
          total?: number
          shipping_address_id?: string | null
          payment_intent_id?: string | null
          tracking_number?: string | null
          estimated_delivery?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          price_at_purchase: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          price_at_purchase: number
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          price_at_purchase?: number
          created_at?: string | null
        }
      }
      group_purchases: {
        Row: {
          id: string
          product_id: string | null
          organizer_id: string | null
          title: string
          description: string | null
          status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
          price_tiers: Json
          minimum_quantity: number
          target_quantity: number
          current_quantity: number | null
          participant_count: number | null
          deadline: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          organizer_id?: string | null
          title: string
          description?: string | null
          status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
          price_tiers: Json
          minimum_quantity: number
          target_quantity: number
          current_quantity?: number | null
          participant_count?: number | null
          deadline: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          organizer_id?: string | null
          title?: string
          description?: string | null
          status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
          price_tiers?: Json
          minimum_quantity?: number
          target_quantity?: number
          current_quantity?: number | null
          participant_count?: number | null
          deadline?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      group_participants: {
        Row: {
          id: string
          group_id: string | null
          user_id: string | null
          quantity: number
          joined_at: string | null
        }
        Insert: {
          id?: string
          group_id?: string | null
          user_id?: string | null
          quantity: number
          joined_at?: string | null
        }
        Update: {
          id?: string
          group_id?: string | null
          user_id?: string | null
          quantity?: number
          joined_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string | null
          user_id: string | null
          rating: number | null
          title: string | null
          comment: string | null
          verified: boolean | null
          helpful: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          user_id?: string | null
          rating?: number | null
          title?: string | null
          comment?: string | null
          verified?: boolean | null
          helpful?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          user_id?: string | null
          rating?: number | null
          title?: string | null
          comment?: string | null
          verified?: boolean | null
          helpful?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: 'ORDER_UPDATE' | 'GROUP_PURCHASE_UPDATE' | 'MESSAGE' | 'REVIEW' | 'SYSTEM'
          title: string
          message: string
          read: boolean | null
          link: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: 'ORDER_UPDATE' | 'GROUP_PURCHASE_UPDATE' | 'MESSAGE' | 'REVIEW' | 'SYSTEM'
          title: string
          message: string
          read?: boolean | null
          link?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: 'ORDER_UPDATE' | 'GROUP_PURCHASE_UPDATE' | 'MESSAGE' | 'REVIEW' | 'SYSTEM'
          title?: string
          message?: string
          read?: boolean | null
          link?: string | null
          created_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string | null
          sender_id: string | null
          content: string
          read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          sender_id?: string | null
          content: string
          read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string | null
          sender_id?: string | null
          content?: string
          read?: boolean | null
          created_at?: string | null
        }
      }
      conversations: {
        Row: {
          id: string
          participants: string[]
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          participants: string[]
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          participants?: string[]
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'BUYER' | 'SELLER' | 'ADMIN'
      product_category: 'BEEF' | 'PORK' | 'CHICKEN' | 'LAMB' | 'SEAFOOD' | 'GAME' | 'OTHER'
      product_status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
      order_status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
      group_purchase_status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
      notification_type: 'ORDER_UPDATE' | 'GROUP_PURCHASE_UPDATE' | 'MESSAGE' | 'REVIEW' | 'SYSTEM'
    }
  }
}
