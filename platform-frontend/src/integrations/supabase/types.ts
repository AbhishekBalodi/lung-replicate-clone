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
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string
          reports_uploaded: boolean | null
          selected_doctor: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone: string
          reports_uploaded?: boolean | null
          selected_doctor: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          reports_uploaded?: boolean | null
          selected_doctor?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          message: string
          name: string
          phone: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          message: string
          name: string
          phone?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          message?: string
          name?: string
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      medicines_catalog: {
        Row: {
          created_at: string | null
          default_frequency: string | null
          duration: string | null
          form: string | null
          id: string
          name: string
          route: string | null
          strength: string | null
        }
        Insert: {
          created_at?: string | null
          default_frequency?: string | null
          duration?: string | null
          form?: string | null
          id?: string
          name: string
          route?: string | null
          strength?: string | null
        }
        Update: {
          created_at?: string | null
          default_frequency?: string | null
          duration?: string | null
          form?: string | null
          id?: string
          name?: string
          route?: string | null
          strength?: string | null
        }
        Relationships: []
      }
      patient_visits: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          diagnosis: string | null
          id: string
          notes: string | null
          patient_id: string | null
          symptoms: string | null
          visit_date: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          symptoms?: string | null
          visit_date?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          symptoms?: string | null
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_visits_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_visit_date: string | null
          full_name: string
          id: string
          is_new_patient: boolean | null
          last_visit_date: string | null
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_visit_date?: string | null
          full_name: string
          id?: string
          is_new_patient?: boolean | null
          last_visit_date?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_visit_date?: string | null
          full_name?: string
          id?: string
          is_new_patient?: boolean | null
          last_visit_date?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prescribed_medicines: {
        Row: {
          created_at: string | null
          dosage: string | null
          duration: string | null
          frequency: string | null
          id: string
          instructions: string | null
          medicine_id: string | null
          medicine_name: string
          patient_id: string | null
          prescribed_date: string | null
          visit_id: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medicine_id?: string | null
          medicine_name: string
          patient_id?: string | null
          prescribed_date?: string | null
          visit_id?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medicine_id?: string | null
          medicine_name?: string
          patient_id?: string | null
          prescribed_date?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescribed_medicines_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescribed_medicines_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescribed_medicines_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "patient_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
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
      app_role: ["user", "admin"],
    },
  },
} as const
