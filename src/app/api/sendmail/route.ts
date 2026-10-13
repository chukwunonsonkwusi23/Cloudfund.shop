import { NextRequest } from "next/server";
import nodemailer from "nodemailer";

// CORS handler using headers
function handleCors() {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, HEAD");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  return headers;
}

export async function POST(req: NextRequest) {
  try {
    // Handle CORS
    const corsHeaders = handleCors();

    const {
      name,
      email,
      message,
    }: {
      name: string;
      email: string;
      message: string;
    } = await req.json();

    const transporter = nodemailer.createTransport({
      host: "edoubleone.net",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "jimoh.akeem@edoubleone.net", // Your email address
        pass: "Macbookair2020", // Your email password
      },
    });

    // Email to the receiver (e.g., admin or yourself)
    const receiverTemplate = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Message:</strong></p>
        <p>${message}</p>
      </div>
    `;

    const mailOptionsReceiver = {
      from: "Contact Us <jimoh.akeem@edoubleone.net>",
      to: "olawaleadeit@gmail.com", // Receiver email
      subject: `New Contact Form Submission from ${name}`,
      html: receiverTemplate, // HTML email body for receiver
    };

    // Email to the sender (confirmation email)
    const senderTemplate = `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Thank You for Contacting Memscepter, ${name}</h2>
    <p>We have received your message and will get back to you shortly.</p>

    <p>Best regards,</p>
    <p>The Team</p>
  </div>
`;

    const mailOptionsSender = {
      from: "Contact Us <jimoh.akeem@edoubleone.net>",
      to: email, // Sender email (confirmation email)
      subject: "Thank You for Your Message",
      html: senderTemplate, // HTML email body for sender
    };

    // Send email to the receiver (admin)
    await transporter.sendMail(mailOptionsReceiver);

    // Send confirmation email to the sender
    await transporter.sendMail(mailOptionsSender);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error:
          error?.response || error?.message || error || "Something went wrong",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...handleCors(),
        },
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: handleCors(),
  });
}
