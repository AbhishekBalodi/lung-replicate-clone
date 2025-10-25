import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createConnection } from "npm:mysql2@3.6.5/promise";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AppointmentData {
  full_name: string;
  email: string;
  phone: string;
  message?: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  reports_uploaded: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let connection;
  
  try {
    const appointmentData: AppointmentData = await req.json();
    
    console.log('Connecting to MySQL database...');
    
    // Create MySQL connection
    connection = await createConnection({
      host: Deno.env.get('MYSQL_HOST'),
      port: parseInt(Deno.env.get('MYSQL_PORT') || '3306'),
      user: Deno.env.get('MYSQL_USERNAME'),
      password: Deno.env.get('MYSQL_PASSWORD'),
      database: Deno.env.get('MYSQL_DATABASE'),
    });

    console.log('Connected to MySQL database');

    // Insert appointment data
    const [result] = await connection.execute(
      `INSERT INTO appointments 
        (full_name, email, phone, message, appointment_date, appointment_time, selected_doctor, reports_uploaded, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        appointmentData.full_name,
        appointmentData.email,
        appointmentData.phone,
        appointmentData.message || '',
        appointmentData.appointment_date,
        appointmentData.appointment_time,
        appointmentData.selected_doctor,
        appointmentData.reports_uploaded ? 1 : 0,
      ]
    );

    console.log('Appointment inserted successfully:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Appointment booked successfully',
        data: result 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in mysql-appointment function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to book appointment' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log('MySQL connection closed');
    }
  }
};

serve(handler);
