require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*', // Allow specific origins or all
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

app.use(express.json());

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false, // use true for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false, // bypass self-signed cert issues
    },
});

console.log("SMTP_HOST", process.env.SMTP_HOST);
console.log("SMTP_PORT", process.env.SMTP_PORT);
console.log("SMTP_USER", process.env.SMTP_USER);
console.log("SMTP_PASS", process.env.SMTP_PASS);
// console.log("SMTP_HOST", process.env.SMTP_HOST);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Mail Sender API is running" });
});

// Handle CORS preflight requests
app.options("/contact", (req, res) => {
    res.status(200).end();
});

// API route to send mail
// API route to handle contact form
app.post("/contact", async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            company,
            serviceInterest,
            message,
        } = req.body;

        // Basic validation
        if (!firstName || !email || !serviceInterest) {
            return res.status(400).json({ success: false, error: "firstName, email, serviceInterest fields are required" });
        }

        // Email content
        const mailOptions = {
            from: `"WhyQTech" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to company inbox
            cc:  process.env.CC_EMAILS ? process.env.CC_EMAILS.split(',') : [], // CC to additional recipients
            subject: `New WhyQTech Contact Form Submission - ${firstName} ${lastName}`,
            text: `
                First Name: ${firstName}
                Last Name: ${lastName}
                Email: ${email}
                Phone: ${phone}
                Company: ${company}
                Service Interest: ${serviceInterest}
                Message: ${message}
            `,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Contact Form Submission</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">WhyQTech</h1>
                            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">New Contact Form Submission</p>
                        </div>
                        
                        <!-- Content Card -->
                        <div style="padding: 30px 20px;">
                            <!-- Contact Info Card -->
                            <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #667eea;">
                                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; font-weight: 600;">Contact Information</h3>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                    <div>
                                        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; font-weight: 500;">First Name</p>
                                        <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${firstName}</p>
                                    </div>
                                    <div>
                                        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; font-weight: 500;">Last Name</p>
                                        <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${lastName}</p>
                                    </div>
                                    <div>
                                        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; font-weight: 500;">Email</p>
                                        <p style="margin: 0; color: #667eea; font-size: 16px; font-weight: 600;">${email}</p>
                                    </div>
                                    <div>
                                        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; font-weight: 500;">Phone</p>
                                        <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${phone || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Company & Service Card -->
                            <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #28a745;">
                                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; font-weight: 600;">Business Information</h3>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                    <div>
                                        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; font-weight: 500;">Company</p>
                                        <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${company || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; font-weight: 500;">Service Interest</p>
                                        <p style="margin: 0; color: #28a745; font-size: 16px; font-weight: 600;">${serviceInterest}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Message Card -->
                            <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; border-left: 4px solid #ffc107;">
                                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; font-weight: 600;">Message</h3>
                                <div style="background-color: white; padding: 15px; border-radius: 4px; border: 1px solid #e9ecef;">
                                    <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #666; font-size: 14px;">This email was sent from the WhyQTech website contact form</p>
                            <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} WhyQTech. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
             `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Message sent successfully" });
    } catch (err) {
        console.error("Email send error:", err);
        res.status(500).json({ success: false, error: "Failed to send message" });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
