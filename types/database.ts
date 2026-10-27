export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: "customer" | "vendor" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "vendor" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "vendor" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      grooming_vendors: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          description: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string;
          phone: string | null;
          email: string | null;
          website_url: string | null;
          rating: number;
          total_reviews: number;
          is_verified: boolean;
          is_active: boolean;
          offers_home_service: boolean;
          offers_clinic_visit: boolean;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["grooming_vendors"]["Row"]> & {
          user_id: string;
          business_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["grooming_vendors"]["Row"]>;
      };
      services: {
        Row: {
          id: string;
          vendor_id: string;
          name: string;
          description: string | null;
          price: number;
          duration_minutes: number;
          category: string;
          pet_type: "dog" | "cat" | "both";
          service_type: "home" | "clinic" | "both";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["services"]["Row"]> & {
          vendor_id: string;
          name: string;
          price: number;
          duration_minutes: number;
          category: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Row"]>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          vendor_id: string;
          service_id: string;
          pet_name: string;
          pet_type: "dog" | "cat" | "other";
          pet_breed: string | null;
          pet_age_years: number | null;
          appointment_date: string;
          appointment_time: string;
          booking_type: "home" | "clinic";
          address: string | null;
          status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
          notes: string | null;
          total_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bookings"]["Row"]> & {
          user_id: string;
          vendor_id: string;
          service_id: string;
          pet_name: string;
          pet_type: "dog" | "cat" | "other";
          appointment_date: string;
          appointment_time: string;
          booking_type: "home" | "clinic";
          total_price: number;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
      };
      shelters: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string;
          phone: string | null;
          email: string | null;
          website_url: string | null;
          emergency_helpline: string | null;
          capacity: number | null;
          current_occupancy: number | null;
          latitude: number | null;
          longitude: number | null;
          is_ngo: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["shelters"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["shelters"]["Row"]>;
      };
      medical_products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          brand: string | null;
          price: number;
          original_price: number | null;
          stock_quantity: number;
          image_url: string | null;
          pet_type: "dog" | "cat" | "both";
          requires_prescription: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["medical_products"]["Row"]> & {
          name: string;
          category: string;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["medical_products"]["Row"]>;
      };
      shelter_animals: {
        Row: {
          id: string;
          shelter_id: string | null;
          posted_by_user_id: string | null;
          name: string;
          species: string;
          breed: string | null;
          age_years: number | null;
          gender: string | null;
          description: string | null;
          image_url: string | null;
          is_vaccinated: boolean;
          is_neutered: boolean;
          adoption_status: "available" | "pending" | "adopted";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["shelter_animals"]["Row"]> & {
          name: string;
          species: string;
        };
        Update: Partial<Database["public"]["Tables"]["shelter_animals"]["Row"]>;
      };
      medical_stores: {
        Row: {
          id: string;
          user_id: string;
          store_name: string;
          description: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string;
          phone: string | null;
          email: string | null;
          website_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["medical_stores"]["Row"]> & {
          user_id: string;
          store_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["medical_stores"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
