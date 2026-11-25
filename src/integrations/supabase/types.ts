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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      contact_enquiries: {
        Row: {
          created_at: string
          customer_name: string
          email: string
          id: string
          message: string
          phone: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          email: string
          id?: string
          message: string
          phone?: string
          status?: string
          subject?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          email?: string
          id?: string
          message?: string
          phone?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      custom_orders: {
        Row: {
          created_at: string
          customer_name: string
          email: string
          id: string
          message: string
          occasion: string
          phone: string
          quotation_cents: number | null
          requirements: Json
          status: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          email: string
          id?: string
          message?: string
          occasion?: string
          phone: string
          quotation_cents?: number | null
          requirements?: Json
          status?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          email?: string
          id?: string
          message?: string
          occasion?: string
          phone?: string
          quotation_cents?: number | null
          requirements?: Json
          status?: string
        }
        Relationships: []
      }
      media_reels: {
        Row: {
          active: boolean
          caption: string
          created_at: string
          id: string
          post_url: string
          product_id: string | null
          sort_order: number
          thumbnail_url: string
        }
        Insert: {
          active?: boolean
          caption?: string
          created_at?: string
          id?: string
          post_url: string
          product_id?: string | null
          sort_order?: number
          thumbnail_url?: string
        }
        Update: {
          active?: boolean
          caption?: string
          created_at?: string
          id?: string
          post_url?: string
          product_id?: string | null
          sort_order?: number
          thumbnail_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_reels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          created_at: string
          customer_name: string
          customer_user_id: string | null
          delivery_instructions: string
          email: string
          gift_message: string
          id: string
          items: Json
          order_reference: string
          payment_status: string
          phone: string
          postal_code: string
          status: string
          subtotal_cents: number
          total_cents: number
        }
        Insert: {
          address: string
          created_at?: string
          customer_name: string
          customer_user_id?: string | null
          delivery_instructions?: string
          email: string
          gift_message?: string
          id?: string
          items: Json
          order_reference?: string
          payment_status?: string
          phone: string
          postal_code: string
          status?: string
          subtotal_cents: number
          total_cents: number
        }
        Update: {
          address?: string
          created_at?: string
          customer_name?: string
          customer_user_id?: string | null
          delivery_instructions?: string
          email?: string
          gift_message?: string
          id?: string
          items?: Json
          order_reference?: string
          payment_status?: string
          phone?: string
          postal_code?: string
          status?: string
          subtotal_cents?: number
          total_cents?: number
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          category_id: string | null
          colors: string[]
          created_at: string
          description: string
          id: string
          image_alt: string
          image_url: string
          is_demo: boolean
          name: string
          price_cents: number
          slug: string
          sort_order: number
          stock_count: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          colors?: string[]
          created_at?: string
          description?: string
          id?: string
          image_alt?: string
          image_url?: string
          is_demo?: boolean
          name: string
          price_cents?: number
          slug: string
          sort_order?: number
          stock_count?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          colors?: string[]
          created_at?: string
          description?: string
          id?: string
          image_alt?: string
          image_url?: string
          is_demo?: boolean
          name?: string
          price_cents?: number
          slug?: string
          sort_order?: number
          stock_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          approved: boolean
          created_at: string
          customer_name: string
          id: string
          product_name: string
          rating: number | null
          review: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          customer_name: string
          id?: string
          product_name?: string
          rating?: number | null
          review: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          customer_name?: string
          id?: string
          product_name?: string
          rating?: number | null
          review?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "editor"],
    },
  },
} as const
