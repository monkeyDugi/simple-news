export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      article: {
        Row: {
          author: string | null
          created_at: string
          id: number
          link: string
          published_at: string
          publisher: string | null
          section: string
          source: string
          source_article_id: string
          source_publisher_id: string | null
          source_section_id: string | null
          thumbnail_link: string | null
          title: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: number
          link: string
          published_at: string
          publisher?: string | null
          section: string
          source?: string
          source_article_id: string
          source_publisher_id?: string | null
          source_section_id?: string | null
          thumbnail_link?: string | null
          title: string
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: number
          link?: string
          published_at?: string
          publisher?: string | null
          section?: string
          source?: string
          source_article_id?: string
          source_publisher_id?: string | null
          source_section_id?: string | null
          thumbnail_link?: string | null
          title?: string
        }
        Relationships: []
      }
      article_content: {
        Row: {
          content: string
          created_at: string
          id: number
        }
        Insert: {
          content: string
          created_at?: string
          id: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_content_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "article"
            referencedColumns: ["id"]
          },
        ]
      }
      article_content_template: {
        Row: {
          content: string
          created_at: string
          id: number
        }
        Insert: {
          content: string
          created_at?: string
          id: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_content_template_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "article_template"
            referencedColumns: ["id"]
          },
        ]
      }
      article_key_term: {
        Row: {
          article_id: number
          explanation: string
          position: number
          term: string
        }
        Insert: {
          article_id: number
          explanation: string
          position: number
          term: string
        }
        Update: {
          article_id?: number
          explanation?: string
          position?: number
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_key_term_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "article"
            referencedColumns: ["id"]
          },
        ]
      }
      article_summary: {
        Row: {
          article_id: number
          created_at: string
          easy_explanation: string
          final_conclusion: string
          model: string
          summary: string
          title_theme: string
        }
        Insert: {
          article_id: number
          created_at?: string
          easy_explanation: string
          final_conclusion: string
          model?: string
          summary: string
          title_theme: string
        }
        Update: {
          article_id?: number
          created_at?: string
          easy_explanation?: string
          final_conclusion?: string
          model?: string
          summary?: string
          title_theme?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_summary_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
            referencedRelation: "article"
            referencedColumns: ["id"]
          },
        ]
      }
      article_template: {
        Row: {
          author: string | null
          id: number
          link: string
          processed_at: string | null
          published_at: string
          publisher: string | null
          scraped_at: string
          section: string
          source: string
          source_article_id: string
          source_publisher_id: string | null
          source_section_id: string | null
          thumbnail_link: string | null
          title: string
        }
        Insert: {
          author?: string | null
          id?: number
          link: string
          processed_at?: string | null
          published_at: string
          publisher?: string | null
          scraped_at?: string
          section: string
          source?: string
          source_article_id: string
          source_publisher_id?: string | null
          source_section_id?: string | null
          thumbnail_link?: string | null
          title: string
        }
        Update: {
          author?: string | null
          id?: number
          link?: string
          processed_at?: string | null
          published_at?: string
          publisher?: string | null
          scraped_at?: string
          section?: string
          source?: string
          source_article_id?: string
          source_publisher_id?: string | null
          source_section_id?: string | null
          thumbnail_link?: string | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      upsert_article_with_summary: {
        Args: { p_model?: string; p_summary: Json; p_template_id: number }
        Returns: number
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

