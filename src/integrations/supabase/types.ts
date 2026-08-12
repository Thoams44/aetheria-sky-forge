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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json
          target_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
        }
        Relationships: []
      }
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
      deliveries: {
        Row: {
          attempts: number
          created_at: string
          delivered_at: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          id: string
          last_error: string | null
          next_attempt_at: string | null
          order_id: string | null
          payload: Json
          player_id: string | null
          status: Database["public"]["Enums"]["delivery_status"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          delivered_at?: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          id?: string
          last_error?: string | null
          next_attempt_at?: string | null
          order_id?: string | null
          payload?: Json
          player_id?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          delivered_at?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          id?: string
          last_error?: string | null
          next_attempt_at?: string | null
          order_id?: string | null
          payload?: Json
          player_id?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_player_id_fkey"
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
      leaderboard_entries: {
        Row: {
          captured_at: string
          category: Database["public"]["Enums"]["leaderboard_category"]
          display_name: string
          id: string
          metadata: Json
          period: Database["public"]["Enums"]["leaderboard_period"]
          player_id: string | null
          rank: number
          score: number
          secondary_label: string | null
        }
        Insert: {
          captured_at?: string
          category: Database["public"]["Enums"]["leaderboard_category"]
          display_name: string
          id?: string
          metadata?: Json
          period?: Database["public"]["Enums"]["leaderboard_period"]
          player_id?: string | null
          rank: number
          score?: number
          secondary_label?: string | null
        }
        Update: {
          captured_at?: string
          category?: Database["public"]["Enums"]["leaderboard_category"]
          display_name?: string
          id?: string
          metadata?: Json
          period?: Database["public"]["Enums"]["leaderboard_period"]
          player_id?: string | null
          rank?: number
          score?: number
          secondary_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string | null
          id: string
          minecraft_username: string | null
          mode: Database["public"]["Enums"]["order_mode"]
          order_number: string
          payment_provider: string | null
          payment_reference: string | null
          player_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          minecraft_username?: string | null
          mode?: Database["public"]["Enums"]["order_mode"]
          order_number?: string
          payment_provider?: string | null
          payment_reference?: string | null
          player_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          minecraft_username?: string | null
          mode?: Database["public"]["Enums"]["order_mode"]
          order_number?: string
          payment_provider?: string | null
          payment_reference?: string | null
          player_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_milestone_claims: {
        Row: {
          aether_coins_granted: number
          claimed_at: string
          id: string
          milestone_id: string
          player_id: string
          shards_granted: number
        }
        Insert: {
          aether_coins_granted?: number
          claimed_at?: string
          id?: string
          milestone_id: string
          player_id: string
          shards_granted?: number
        }
        Update: {
          aether_coins_granted?: number
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
      store_products: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          description: string | null
          display_order: number
          grade_id: string | null
          id: string
          name: string
          price: number | null
          quantity: number | null
          slug: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number
          grade_id?: string | null
          id?: string
          name: string
          price?: number | null
          quantity?: number | null
          slug: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number
          grade_id?: string | null
          id?: string
          name?: string
          price?: number | null
          quantity?: number | null
          slug?: string
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_products_grade_id_fkey"
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
          aether_coins_reward: number
          bonus_reward: string | null
          created_at: string
          display_order: number
          id: string
          shards_reward: number | null
          updated_at: string
          vote_count_required: number
        }
        Insert: {
          active?: boolean
          aether_coins_reward?: number
          bonus_reward?: string | null
          created_at?: string
          display_order?: number
          id?: string
          shards_reward?: number | null
          updated_at?: string
          vote_count_required: number
        }
        Update: {
          active?: boolean
          aether_coins_reward?: number
          bonus_reward?: string | null
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
      delivery_status: "PENDING" | "PROCESSING" | "DELIVERED" | "FAILED"
      delivery_type: "GRADE" | "AETHER_COINS" | "SHARDS" | "VOTE_KEY" | "CUSTOM"
      leaderboard_category: "PLAYERS" | "ISLANDS" | "VOTERS"
      leaderboard_period: "DAY" | "WEEK" | "MONTH" | "ALL_TIME"
      order_mode: "REAL" | "TEST"
      order_status:
        | "PENDING"
        | "PAID"
        | "PROCESSING"
        | "DELIVERED"
        | "FAILED"
        | "REFUNDED"
        | "CANCELLED"
      product_type: "GRADE" | "AETHER_COINS"
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
      delivery_status: ["PENDING", "PROCESSING", "DELIVERED", "FAILED"],
      delivery_type: ["GRADE", "AETHER_COINS", "SHARDS", "VOTE_KEY", "CUSTOM"],
      leaderboard_category: ["PLAYERS", "ISLANDS", "VOTERS"],
      leaderboard_period: ["DAY", "WEEK", "MONTH", "ALL_TIME"],
      order_mode: ["REAL", "TEST"],
      order_status: [
        "PENDING",
        "PAID",
        "PROCESSING",
        "DELIVERED",
        "FAILED",
        "REFUNDED",
        "CANCELLED",
      ],
      product_type: ["GRADE", "AETHER_COINS"],
      transaction_type: ["CREDIT", "DEBIT"],
      vote_status: ["PENDING", "VALIDATED", "REWARDED", "REJECTED"],
    },
  },
} as const
