import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      fullName,
      email,
      phone,
      appointmentDate,
      appointmentTime,
      selectedDoctor,
      message,
    }: AppointmentEmailRequest = await req.json();

    console.log("Sending appointment confirmation emails to:", email, "and psmann58@yahoo.com");

    // Send email to patient
    const patientEmailResponse = await resend.emails.send({
      from: "Delhi Chest Physician <onboarding@resend.dev>",
      to: [email],
      subject: "Appointment Confirmation - Delhi Chest Physician",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1e40af; margin-bottom: 20px;">Appointment Confirmation</h1>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Dear <strong>${fullName}</strong>,
            </p>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              Thank you for booking an appointment with Delhi Chest Physician. We have received your request and our team will contact you shortly to confirm the details.
            </p>
            
            <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Appointment Details</h2>
              <table style="width: 100%; font-size: 14px; color: #333;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Patient Name:</strong></td>
                  <td style="padding: 8px 0;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Doctor:</strong></td>
                  <td style="padding: 8px 0;">${selectedDoctor}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Date:</strong></td>
                  <td style="padding: 8px 0;">${appointmentDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Time:</strong></td>
                  <td style="padding: 8px 0;">${appointmentTime}</td>
                </tr>
                ${message ? `
                <tr>
                  <td style="padding: 8px 0; vertical-align: top;"><strong>Message:</strong></td>
                  <td style="padding: 8px 0;">${message}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              If you need to reschedule or have any questions, please contact us at:
            </p>
            <p style="font-size: 14px; color: #1e40af; margin: 5px 0;">
              <strong>Phone:</strong> +91-9810589799<br>
              <strong>Address:</strong> 321 Main Road, Bhai Parmanand Colony, Near Dr. Mukherjee Nagar, Delhi-110009
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              <strong style="color: #1e40af;">Delhi Chest Physician Team</strong>
            </p>
          </div>
          
          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
            This is an automated confirmation email. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log("Patient email sent successfully:", patientEmailResponse);

    // Send notification email to doctor
    const doctorEmailResponse = await resend.emails.send({
      from: "Delhi Chest Physician <onboarding@resend.dev>",
      to: ["psmann58@yahoo.com"],
      subject: "New Appointment Booking - Delhi Chest Physician",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1e40af; margin-bottom: 20px;">New Appointment Booking</h1>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Dear Doctor,
            </p>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              A new appointment has been booked. Please find the details below:
            </p>
            
            <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Patient & Appointment Details</h2>
              <table style="width: 100%; font-size: 14px; color: #333;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Patient Name:</strong></td>
                  <td style="padding: 8px 0;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Doctor:</strong></td>
                  <td style="padding: 8px 0;">${selectedDoctor}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Date:</strong></td>
                  <td style="padding: 8px 0;">${appointmentDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Time:</strong></td>
                  <td style="padding: 8px 0;">${appointmentTime}</td>
                </tr>
                ${message ? `
                <tr>
                  <td style="padding: 8px 0; vertical-align: top;"><strong>Patient Query/Message:</strong></td>
                  <td style="padding: 8px 0;">${message}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              <strong style="color: #1e40af;">Delhi Chest Physician System</strong>
            </p>
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
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-appointment-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
