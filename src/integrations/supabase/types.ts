export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      clicks: {
        Row: {
          created_at: string
          id: string
          recommendation_id: string | null
          sponsored_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          recommendation_id?: string | null
          sponsored_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          recommendation_id?: string | null
          sponsored_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clicks_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clicks_sponsored_id_fkey"
            columns: ["sponsored_id"]
            isOneToOne: false
            referencedRelation: "sponsored_content"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_url: string | null
          created_at: string
          creator_id: string
          id: string
          name: string
          position: number
          type: Database["public"]["Enums"]["collection_type"]
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          creator_id: string
          id?: string
          name: string
          position?: number
          type?: Database["public"]["Enums"]["collection_type"]
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          name?: string
          position?: number
          type?: Database["public"]["Enums"]["collection_type"]
        }
        Relationships: [
          {
            foreignKeyName: "collections_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          follower_id: string
          recommendation_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          recommendation_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          recommendation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          creator_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          follower_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          avatar_url: string | null
          bio: string | null
          categories: Database["public"]["Enums"]["category"][]
          created_at: string
          featured: boolean
          full_name: string
          id: string
          socials: Json
          updated_at: string
          user_id: string | null
          username: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          bio?: string | null
          categories?: Database["public"]["Enums"]["category"][]
          created_at?: string
          featured?: boolean
          full_name?: string
          id?: string
          socials?: Json
          updated_at?: string
          user_id?: string | null
          username: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          bio?: string | null
          categories?: Database["public"]["Enums"]["category"][]
          created_at?: string
          featured?: boolean
          full_name?: string
          id?: string
          socials?: Json
          updated_at?: string
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      recommendation_collections: {
        Row: {
          collection_id: string
          recommendation_id: string
        }
        Insert: {
          collection_id: string
          recommendation_id: string
        }
        Update: {
          collection_id?: string
          recommendation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_collections_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          brand: string | null
          category: Database["public"]["Enums"]["category"]
          created_at: string
          creator_id: string
          external_url: string
          featured: boolean
          id: string
          image_url: string
          review: string
          tags: string[]
          title: string
          updated_at: string
          week_start: string | null
        }
        Insert: {
          brand?: string | null
          category: Database["public"]["Enums"]["category"]
          created_at?: string
          creator_id: string
          external_url: string
          featured?: boolean
          id?: string
          image_url: string
          review?: string
          tags?: string[]
          title: string
          updated_at?: string
          week_start?: string | null
        }
        Update: {
          brand?: string | null
          category?: Database["public"]["Enums"]["category"]
          created_at?: string
          creator_id?: string
          external_url?: string
          featured?: boolean
          id?: string
          image_url?: string
          review?: string
          tags?: string[]
          title?: string
          updated_at?: string
          week_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsored_content: {
        Row: {
          active: boolean
          brand: string
          created_at: string
          ends_at: string | null
          headline: string | null
          id: string
          image_url: string
          link_url: string
          placement: string
          starts_at: string
          type: Database["public"]["Enums"]["ad_type"]
        }
        Insert: {
          active?: boolean
          brand: string
          created_at?: string
          ends_at?: string | null
          headline?: string | null
          id?: string
          image_url: string
          link_url: string
          placement?: string
          starts_at?: string
          type: Database["public"]["Enums"]["ad_type"]
        }
        Update: {
          active?: boolean
          brand?: string
          created_at?: string
          ends_at?: string | null
          headline?: string | null
          id?: string
          image_url?: string
          link_url?: string
          placement?: string
          starts_at?: string
          type?: Database["public"]["Enums"]["ad_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_type: "creador" | "seguidor"
      ad_type: "banner" | "modal" | "card"
      category: "belleza" | "moda" | "tech"
      collection_type: "semanal" | "categoria" | "personalizada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["creador", "seguidor"],
      ad_type: ["banner", "modal", "card"],
      category: ["belleza", "moda", "tech"],
      collection_type: ["semanal", "categoria", "personalizada"],
    },
  },
} as const
