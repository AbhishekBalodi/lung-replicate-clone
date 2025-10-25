import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createConnection } from "npm:mysql2@3.6.5/promise";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let connection;
  
  try {
    const contactData: ContactData = await req.json();
    
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

    // Insert contact data
    const [result] = await connection.execute(
      `INSERT INTO contacts 
        (name, email, phone, subject, message, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        contactData.name,
        contactData.email,
        contactData.phone || '',
        contactData.subject,
        contactData.message,
      ]
    );

    console.log('Contact message inserted successfully:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message sent successfully',
        data: result 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in mysql-contact function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send message' 
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
