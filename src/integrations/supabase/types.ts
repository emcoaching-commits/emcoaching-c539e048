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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      about_media: {
        Row: {
          created_at: string
          id: string
          position: number
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          type?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          type?: string
          url?: string
        }
        Relationships: []
      }
      appointment_types: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          id: string
          pricing_plan_id: string | null
          proposed_slot_id: string | null
          status: string
          time_slot_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pricing_plan_id?: string | null
          proposed_slot_id?: string | null
          status?: string
          time_slot_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pricing_plan_id?: string | null
          proposed_slot_id?: string | null
          status?: string
          time_slot_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_pricing_plan_id_fkey"
            columns: ["pricing_plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_proposed_slot_id_fkey"
            columns: ["proposed_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_links: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          position: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          position?: number
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          position?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          client_id: string | null
          client_name: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          type: string
        }
        Insert: {
          client_id?: string | null
          client_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          type: string
        }
        Update: {
          client_id?: string | null
          client_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          type?: string
        }
        Relationships: []
      }
      pricing_plan_media: {
        Row: {
          created_at: string
          id: string
          position: number
          pricing_plan_id: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          pricing_plan_id: string
          type?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          pricing_plan_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_plan_media_pricing_plan_id_fkey"
            columns: ["pricing_plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          background_image_url: string | null
          created_at: string
          description: string | null
          details: string[] | null
          features: string[] | null
          id: string
          includes: string[] | null
          is_popular: boolean | null
          long_description: string | null
          name: string
          paypal_url: string | null
          price: number
          sessions_count: number
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string
          description?: string | null
          details?: string[] | null
          features?: string[] | null
          id?: string
          includes?: string[] | null
          is_popular?: boolean | null
          long_description?: string | null
          name: string
          paypal_url?: string | null
          price: number
          sessions_count?: number
        }
        Update: {
          background_image_url?: string | null
          created_at?: string
          description?: string | null
          details?: string[] | null
          features?: string[] | null
          id?: string
          includes?: string[] | null
          is_popular?: boolean | null
          long_description?: string | null
          name?: string
          paypal_url?: string | null
          price?: number
          sessions_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          assigned_plan_id: string | null
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          full_name: string | null
          gender: string | null
          google_sheet_url: string | null
          has_active_subscription: boolean
          height: number | null
          id: string
          next_payment_date: string | null
          payment_reminder_active: boolean
          phone: string | null
          subscription_activated_at: string | null
          subscription_start_date: string | null
          updated_at: string
          user_id: string
          weight: number | null
          welcome_popup_dismissed: boolean
        }
        Insert: {
          age?: number | null
          assigned_plan_id?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          google_sheet_url?: string | null
          has_active_subscription?: boolean
          height?: number | null
          id?: string
          next_payment_date?: string | null
          payment_reminder_active?: boolean
          phone?: string | null
          subscription_activated_at?: string | null
          subscription_start_date?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
          welcome_popup_dismissed?: boolean
        }
        Update: {
          age?: number | null
          assigned_plan_id?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          google_sheet_url?: string | null
          has_active_subscription?: boolean
          height?: number | null
          id?: string
          next_payment_date?: string | null
          payment_reminder_active?: boolean
          phone?: string | null
          subscription_activated_at?: string | null
          subscription_start_date?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
          welcome_popup_dismissed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_assigned_plan_id_fkey"
            columns: ["assigned_plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_responses: {
        Row: {
          blessures: string | null
          commentaire: string | null
          created_at: string
          frequence: string | null
          id: string
          niveau: string | null
          objectifs: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blessures?: string | null
          commentaire?: string | null
          created_at?: string
          frequence?: string | null
          id?: string
          niveau?: string | null
          objectifs?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blessures?: string | null
          commentaire?: string | null
          created_at?: string
          frequence?: string | null
          id?: string
          niveau?: string | null
          objectifs?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          is_featured: boolean
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          details: string[] | null
          icon: string | null
          id: string
          image_url: string | null
          includes: string[] | null
          intro: string | null
          is_popular: boolean | null
          position: number | null
          price: string
          slug: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          details?: string[] | null
          icon?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          intro?: string | null
          is_popular?: boolean | null
          position?: number | null
          price: string
          slug: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          details?: string[] | null
          icon?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          intro?: string | null
          is_popular?: boolean | null
          position?: number | null
          price?: string
          slug?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          appointment_type_id: string | null
          created_at: string
          date: string
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
        }
        Insert: {
          appointment_type_id?: string | null
          created_at?: string
          date: string
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
        }
        Update: {
          appointment_type_id?: string | null
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_types"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
