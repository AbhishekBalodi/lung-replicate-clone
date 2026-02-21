import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Resend client initialization
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const DOCTOR_EMAIL = Deno.env.get("DOCTOR_EMAIL") || "psmann58@yahoo.com";

interface ResendEmailOptions {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

const sendEmail = async (options: ResendEmailOptions) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(options),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send email");
  }
  
  return response.json();
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AppointmentEmailRequest {
  fullName: string;
  email: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  selectedDoctor: string;
  message?: string;
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max requests per window
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Sanitize string to prevent HTML injection in emails
function sanitize(str: string | undefined): string {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit by IP
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    if (isRateLimited(clientIP)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body: AppointmentEmailRequest = await req.json();
    const { fullName, email, phone, appointmentDate, appointmentTime, selectedDoctor, message } = body;

    // Input validation
    if (!fullName || !email || !phone || !appointmentDate || !appointmentTime || !selectedDoctor) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify appointment exists in the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: appointment, error: dbError } = await supabase
      .from("appointments")
      .select("id")
      .eq("email", email)
      .eq("appointment_date", appointmentDate)
      .eq("appointment_time", appointmentTime)
      .limit(1)
      .maybeSingle();

    if (dbError || !appointment) {
      return new Response(JSON.stringify({ error: "No matching appointment found. Email not sent." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Sanitize all user inputs before embedding in HTML
    const sFullName = sanitize(fullName);
    const sEmail = sanitize(email);
    const sPhone = sanitize(phone);
    const sDoctor = sanitize(selectedDoctor);
    const sDate = sanitize(appointmentDate);
    const sTime = sanitize(appointmentTime);
    const sMessage = sanitize(message);

    console.log("Sending appointment confirmation email for verified appointment:", appointment.id);

    // Send email to patient
    const patientEmailResponse = await sendEmail({
      from: "Delhi Chest Physician <onboarding@resend.dev>",
      to: [email],
      subject: "Appointment Confirmation - Delhi Chest Physician",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1e40af; margin-bottom: 20px;">Appointment Confirmation</h1>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear <strong>${sFullName}</strong>,</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Thank you for booking an appointment with Delhi Chest Physician. We have received your request and our team will contact you shortly to confirm the details.</p>
            <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Appointment Details</h2>
              <table style="width: 100%; font-size: 14px; color: #333;">
                <tr><td style="padding: 8px 0;"><strong>Patient Name:</strong></td><td style="padding: 8px 0;">${sFullName}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Email:</strong></td><td style="padding: 8px 0;">${sEmail}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Phone:</strong></td><td style="padding: 8px 0;">${sPhone}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Doctor:</strong></td><td style="padding: 8px 0;">${sDoctor}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Date:</strong></td><td style="padding: 8px 0;">${sDate}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Time:</strong></td><td style="padding: 8px 0;">${sTime}</td></tr>
                ${sMessage ? `<tr><td style="padding: 8px 0; vertical-align: top;"><strong>Message:</strong></td><td style="padding: 8px 0;">${sMessage}</td></tr>` : ''}
              </table>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">If you need to reschedule or have any questions, please contact us at:</p>
            <p style="font-size: 14px; color: #1e40af; margin: 5px 0;"><strong>Phone:</strong> +91-9810589799<br><strong>Address:</strong> 321 Main Road, Bhai Parmanand Colony, Near Dr. Mukherjee Nagar, Delhi-110009</p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">Best regards,<br><strong style="color: #1e40af;">Delhi Chest Physician Team</strong></p>
          </div>
          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">This is an automated confirmation email. Please do not reply to this email.</p>
        </div>
      `,
    });

    console.log("Patient email sent successfully:", patientEmailResponse);

    // Send notification email to doctor (using env var)
    const doctorEmailResponse = await sendEmail({
      from: "Delhi Chest Physician <onboarding@resend.dev>",
      to: [DOCTOR_EMAIL],
      subject: "New Appointment Booking - Delhi Chest Physician",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1e40af; margin-bottom: 20px;">New Appointment Booking</h1>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear Doctor,</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">A new appointment has been booked. Please find the details below:</p>
            <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Patient &amp; Appointment Details</h2>
              <table style="width: 100%; font-size: 14px; color: #333;">
                <tr><td style="padding: 8px 0;"><strong>Patient Name:</strong></td><td style="padding: 8px 0;">${sFullName}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Email:</strong></td><td style="padding: 8px 0;">${sEmail}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Phone:</strong></td><td style="padding: 8px 0;">${sPhone}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Doctor:</strong></td><td style="padding: 8px 0;">${sDoctor}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Date:</strong></td><td style="padding: 8px 0;">${sDate}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Time:</strong></td><td style="padding: 8px 0;">${sTime}</td></tr>
                ${sMessage ? `<tr><td style="padding: 8px 0; vertical-align: top;"><strong>Patient Query/Message:</strong></td><td style="padding: 8px 0;">${sMessage}</td></tr>` : ''}
              </table>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">Best regards,<br><strong style="color: #1e40af;">Delhi Chest Physician System</strong></p>
          </div>
        </div>
      `,
    });

    console.log("Doctor notification email sent successfully:", doctorEmailResponse);

    return new Response(JSON.stringify({ 
      patient: patientEmailResponse, 
      doctor: doctorEmailResponse 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-appointment-email function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
