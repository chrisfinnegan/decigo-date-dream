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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      flags: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      invites: {
        Row: {
          channel: string
          consent_at: string
          id: string
          name: string | null
          plan_id: string | null
          sent_count: number | null
          stopped: boolean | null
          value: string
        }
        Insert: {
          channel: string
          consent_at: string
          id?: string
          name?: string | null
          plan_id?: string | null
          sent_count?: number | null
          stopped?: boolean | null
          value: string
        }
        Update: {
          channel?: string
          consent_at?: string
          id?: string
          name?: string | null
          plan_id?: string | null
          sent_count?: number | null
          stopped?: boolean | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans_public"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          address: string
          id: string
          lat: number
          lng: number
          name: string
          photo_ref: string | null
          plan_id: string | null
          price_band: string | null
          rank: number
          source_id: string | null
          tip: string | null
          why_it_fits: string | null
        }
        Insert: {
          address: string
          id?: string
          lat: number
          lng: number
          name: string
          photo_ref?: string | null
          plan_id?: string | null
          price_band?: string | null
          rank: number
          source_id?: string | null
          tip?: string | null
          why_it_fits?: string | null
        }
        Update: {
          address?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          photo_ref?: string | null
          plan_id?: string | null
          price_band?: string | null
          rank?: number
          source_id?: string | null
          tip?: string | null
          why_it_fits?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "options_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "options_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans_public"
            referencedColumns: ["id"]
          },
        ]
      }
      places_cache: {
        Row: {
          cache_key: string
          cache_type: string
          created_at: string | null
          data: Json
          expires_at: string
          id: string
        }
        Insert: {
          cache_key: string
          cache_type: string
          created_at?: string | null
          data: Json
          expires_at: string
          id?: string
        }
        Update: {
          cache_key?: string
          cache_type?: string
          created_at?: string | null
          data?: Json
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          budget_band: string
          canceled: boolean | null
          created_at: string | null
          date_end: string
          date_start: string
          daypart: string
          decision_deadline: string
          headcount: number
          id: string
          locked: boolean | null
          locked_at: string | null
          magic_token: string
          mode: string
          neighborhood: string
          neighborhood_lat: number | null
          neighborhood_lng: number | null
          neighborhood_place_id: string | null
          notes_chips: string[] | null
          notes_raw: string | null
          threshold: number
          two_stop: boolean | null
        }
        Insert: {
          budget_band: string
          canceled?: boolean | null
          created_at?: string | null
          date_end: string
          date_start: string
          daypart: string
          decision_deadline: string
          headcount: number
          id?: string
          locked?: boolean | null
          locked_at?: string | null
          magic_token: string
          mode: string
          neighborhood: string
          neighborhood_lat?: number | null
          neighborhood_lng?: number | null
          neighborhood_place_id?: string | null
          notes_chips?: string[] | null
          notes_raw?: string | null
          threshold: number
          two_stop?: boolean | null
        }
        Update: {
          budget_band?: string
          canceled?: boolean | null
          created_at?: string | null
          date_end?: string
          date_start?: string
          daypart?: string
          decision_deadline?: string
          headcount?: number
          id?: string
          locked?: boolean | null
          locked_at?: string | null
          magic_token?: string
          mode?: string
          neighborhood?: string
          neighborhood_lat?: number | null
          neighborhood_lng?: number | null
          neighborhood_place_id?: string | null
          notes_chips?: string[] | null
          notes_raw?: string | null
          threshold?: number
          two_stop?: boolean | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          id: string
          invite_id: string | null
          kind: string
          plan_id: string | null
          status: string | null
          when_at: string
        }
        Insert: {
          id?: string
          invite_id?: string | null
          kind: string
          plan_id?: string | null
          status?: string | null
          when_at: string
        }
        Update: {
          id?: string
          invite_id?: string | null
          kind?: string
          plan_id?: string | null
          status?: string | null
          when_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans_public"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string | null
          plan_id: string | null
          voter_hash: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id?: string | null
          plan_id?: string | null
          voter_hash: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string | null
          plan_id?: string | null
          voter_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      plans_public: {
        Row: {
          budget_band: string | null
          canceled: boolean | null
          created_at: string | null
          date_end: string | null
          date_start: string | null
          daypart: string | null
          decision_deadline: string | null
          headcount: number | null
          id: string | null
          locked: boolean | null
          locked_at: string | null
          mode: string | null
          neighborhood: string | null
          neighborhood_lat: number | null
          neighborhood_lng: number | null
          neighborhood_place_id: string | null
          notes_chips: string[] | null
          notes_raw: string | null
          threshold: number | null
          two_stop: boolean | null
        }
        Insert: {
          budget_band?: string | null
          canceled?: boolean | null
          created_at?: string | null
          date_end?: string | null
          date_start?: string | null
          daypart?: string | null
          decision_deadline?: string | null
          headcount?: number | null
          id?: string | null
          locked?: boolean | null
          locked_at?: string | null
          mode?: string | null
          neighborhood?: string | null
          neighborhood_lat?: number | null
          neighborhood_lng?: number | null
          neighborhood_place_id?: string | null
          notes_chips?: string[] | null
          notes_raw?: string | null
          threshold?: number | null
          two_stop?: boolean | null
        }
        Update: {
          budget_band?: string | null
          canceled?: boolean | null
          created_at?: string | null
          date_end?: string | null
          date_start?: string | null
          daypart?: string | null
          decision_deadline?: string | null
          headcount?: number | null
          id?: string | null
          locked?: boolean | null
          locked_at?: string | null
          mode?: string | null
          neighborhood?: string | null
          neighborhood_lat?: number | null
          neighborhood_lng?: number | null
          neighborhood_place_id?: string | null
          notes_chips?: string[] | null
          notes_raw?: string | null
          threshold?: number | null
          two_stop?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
