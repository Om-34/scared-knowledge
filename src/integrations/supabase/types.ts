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
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_wisdom: {
        Row: {
          created_at: string | null
          display_date: string
          id: string
          verse_id: string
        }
        Insert: {
          created_at?: string | null
          display_date: string
          id?: string
          verse_id: string
        }
        Update: {
          created_at?: string | null
          display_date?: string
          id?: string
          verse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_wisdom_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: false
            referencedRelation: "verses"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_logs: {
        Row: {
          conversation_id: string | null
          id: string
          logged_at: string
          mood_after: string | null
          mood_before: string
          notes: string | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          logged_at?: string
          mood_after?: string | null
          mood_before: string
          notes?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          id?: string
          logged_at?: string
          mood_after?: string | null
          mood_before?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      scripture_chapters: {
        Row: {
          chapter_number: number
          chapter_summary: string | null
          chapter_title: string
          created_at: string | null
          id: string
          scripture_name: string
        }
        Insert: {
          chapter_number: number
          chapter_summary?: string | null
          chapter_title: string
          created_at?: string | null
          id?: string
          scripture_name: string
        }
        Update: {
          chapter_number?: number
          chapter_summary?: string | null
          chapter_title?: string
          created_at?: string | null
          id?: string
          scripture_name?: string
        }
        Relationships: []
      }
      study_cards: {
        Row: {
          created_at: string | null
          ease_factor: number | null
          id: string
          last_reviewed_at: string | null
          next_review_date: string
          repetitions: number | null
          review_interval: number | null
          user_id: string
          verse_id: string
        }
        Insert: {
          created_at?: string | null
          ease_factor?: number | null
          id?: string
          last_reviewed_at?: string | null
          next_review_date?: string
          repetitions?: number | null
          review_interval?: number | null
          user_id: string
          verse_id: string
        }
        Update: {
          created_at?: string | null
          ease_factor?: number | null
          id?: string
          last_reviewed_at?: string | null
          next_review_date?: string
          repetitions?: number | null
          review_interval?: number | null
          user_id?: string
          verse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_cards_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: false
            referencedRelation: "verses"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          cards_correct: number | null
          cards_studied: number | null
          created_at: string | null
          id: string
          session_date: string | null
          session_duration_minutes: number | null
          user_id: string
        }
        Insert: {
          cards_correct?: number | null
          cards_studied?: number | null
          created_at?: string | null
          id?: string
          session_date?: string | null
          session_duration_minutes?: number | null
          user_id: string
        }
        Update: {
          cards_correct?: number | null
          cards_studied?: number | null
          created_at?: string | null
          id?: string
          session_date?: string | null
          session_duration_minutes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      verse_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          user_id: string
          verse_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id: string
          verse_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string
          verse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verse_bookmarks_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: false
            referencedRelation: "verses"
            referencedColumns: ["id"]
          },
        ]
      }
      verses: {
        Row: {
          chapter_id: string
          commentary: string | null
          created_at: string | null
          english_translation: string
          id: string
          sanskrit_text: string
          transliteration: string
          verse_number: number
        }
        Insert: {
          chapter_id: string
          commentary?: string | null
          created_at?: string | null
          english_translation: string
          id?: string
          sanskrit_text: string
          transliteration: string
          verse_number: number
        }
        Update: {
          chapter_id?: string
          commentary?: string | null
          created_at?: string | null
          english_translation?: string
          id?: string
          sanskrit_text?: string
          transliteration?: string
          verse_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "verses_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "scripture_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      wellness_resources: {
        Row: {
          category: string
          content: string
          created_at: string
          description: string
          duration_minutes: number | null
          id: string
          scripture_reference: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          description: string
          duration_minutes?: number | null
          id?: string
          scripture_reference?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          description?: string
          duration_minutes?: number | null
          id?: string
          scripture_reference?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_due_study_cards: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          card_id: string
          chapter_number: number
          chapter_title: string
          ease_factor: number
          english_translation: string
          repetitions: number
          review_interval: number
          sanskrit_text: string
          scripture_name: string
          transliteration: string
          verse_id: string
          verse_number: number
        }[]
      }
      search_verses: {
        Args: { search_term: string }
        Returns: {
          chapter_number: number
          chapter_title: string
          commentary: string
          english_translation: string
          sanskrit_text: string
          transliteration: string
          verse_id: string
          verse_number: number
        }[]
      }
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
