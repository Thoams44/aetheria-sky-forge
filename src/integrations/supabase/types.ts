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
      currency_transactions: {
        Row: {
          amount: number
          created_at: string
          currency_type: Database["public"]["Enums"]["currency_type"]
          id: string
          player_id: string
          reason: string
          reference_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          currency_type: Database["public"]["Enums"]["currency_type"]
          id?: string
          player_id: string
          reason: string
          reference_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          currency_type?: Database["public"]["Enums"]["currency_type"]
          id?: string
          player_id?: string
          reason?: string
          reference_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "currency_transactions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          active: boolean
          advantages: Json
          color: string | null
          created_at: string
          currency: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          name: string
          price: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          advantages?: Json
          color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          name: string
          price?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          advantages?: Json
          color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          name?: string
          price?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_milestone_claims: {
        Row: {
          claimed_at: string
          id: string
          milestone_id: string
          player_id: string
          shards_granted: number
        }
        Insert: {
          claimed_at?: string
          id?: string
          milestone_id: string
          player_id: string
          shards_granted?: number
        }
        Update: {
          claimed_at?: string
          id?: string
          milestone_id?: string
          player_id?: string
          shards_granted?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_milestone_claims_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "vote_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_milestone_claims_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          aether_coins_balance: number
          created_at: string
          grade_expires_at: string | null
          grade_id: string | null
          grade_obtained_at: string | null
          id: string
          last_seen_at: string | null
          minecraft_username: string | null
          minecraft_uuid: string | null
          shards_balance: number
          updated_at: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          aether_coins_balance?: number
          created_at?: string
          grade_expires_at?: string | null
          grade_id?: string | null
          grade_obtained_at?: string | null
          id?: string
          last_seen_at?: string | null
          minecraft_username?: string | null
          minecraft_uuid?: string | null
          shards_balance?: number
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          aether_coins_balance?: number
          created_at?: string
          grade_expires_at?: string | null
          grade_id?: string | null
          grade_obtained_at?: string | null
          id?: string
          last_seen_at?: string | null
          minecraft_username?: string | null
          minecraft_uuid?: string | null
          shards_balance?: number
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "players_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
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
      vote_milestones: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          id: string
          shards_reward: number | null
          updated_at: string
          vote_count_required: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          shards_reward?: number | null
          updated_at?: string
          vote_count_required: number
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          shards_reward?: number | null
          updated_at?: string
          vote_count_required?: number
        }
        Relationships: []
      }
      vote_platforms: {
        Row: {
          cooldown_seconds: number
          created_at: string
          description: string | null
          display_order: number
          enabled: boolean
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
          vote_url: string | null
        }
        Insert: {
          cooldown_seconds?: number
          created_at?: string
          description?: string | null
          display_order?: number
          enabled?: boolean
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
          vote_url?: string | null
        }
        Update: {
          cooldown_seconds?: number
          created_at?: string
          description?: string | null
          display_order?: number
          enabled?: boolean
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
          vote_url?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          external_vote_id: string | null
          id: string
          platform_id: string
          player_id: string
          reward_claimed: boolean
          status: Database["public"]["Enums"]["vote_status"]
          validated_at: string | null
          voted_at: string
        }
        Insert: {
          created_at?: string
          external_vote_id?: string | null
          id?: string
          platform_id: string
          player_id: string
          reward_claimed?: boolean
          status?: Database["public"]["Enums"]["vote_status"]
          validated_at?: string | null
          voted_at?: string
        }
        Update: {
          created_at?: string
          external_vote_id?: string | null
          id?: string
          platform_id?: string
          player_id?: string
          reward_claimed?: boolean
          status?: Database["public"]["Enums"]["vote_status"]
          validated_at?: string | null
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "vote_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_player_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "player" | "staff" | "admin" | "founder"
      currency_type: "AETHER_COINS" | "SHARDS"
      transaction_type: "CREDIT" | "DEBIT"
      vote_status: "PENDING" | "VALIDATED" | "REWARDED" | "REJECTED"
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
      app_role: ["player", "staff", "admin", "founder"],
      currency_type: ["AETHER_COINS", "SHARDS"],
      transaction_type: ["CREDIT", "DEBIT"],
      vote_status: ["PENDING", "VALIDATED", "REWARDED", "REJECTED"],
    },
  },
} as const
