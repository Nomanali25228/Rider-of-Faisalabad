import nodemailer from 'nodemailer';
import { IncomingForm } from 'formidable';
import path from 'path';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

async function parseForm(req) {
    return new Promise((resolve, reject) => {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const form = new IncomingForm({
            uploadDir,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
        });
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { fields, files } = await parseForm(req);

        const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
        const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
        const phone = Array.isArray(fields.phone) ? fields.phone[0] : fields.phone;
        const subject = Array.isArray(fields.subject) ? fields.subject[0] : fields.subject;
        const message = Array.isArray(fields.message) ? fields.message[0] : fields.message;
        const voiceNote = files.voiceNote ? (Array.isArray(files.voiceNote) ? files.voiceNote[0] : files.voiceNote) : null;

        if (!name || !message) {
            return res.status(400).json({ success: false, message: 'Name and message are required.' });
        }

        if (process.env.SMTP_HOST) {
            const nodemailer = (await import('nodemailer')).default;
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_PORT == 465,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
                tls: { rejectUnauthorized: false }
            });

            const voiceUrl = voiceNote ? `${process.env.NEXT_PUBLIC_SITE_URL || ''}/uploads/${path.basename(voiceNote.filepath)}` : null;

            // 1. Send Email to Admin
            if (process.env.ADMIN_EMAIL) {
                await transporter.sendMail({
                    from: `"Rider of Faisalabad - Inquiry" <${process.env.SMTP_USER}>`,
                    to: process.env.ADMIN_EMAIL,
                    subject: `📩 New Contact Inquiry: ${subject || 'General'}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #2F8F83; border-bottom: 2px solid #2F8F83; padding-bottom: 10px;">New Contact Message</h2>
                            <p><strong>Customer Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email || 'N/A'}</p>
                            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 15px;">
                                <p style="margin-top: 0;"><strong>Message:</strong></p>
                                <p style="white-space: pre-wrap;">${message}</p>
                            </div>
                            ${voiceUrl ? `
                            <div style="margin-top: 20px; padding: 15px; background: #e6f4f1; border-radius: 8px;">
                                <p>🎤 <strong>A voice note was attached:</strong></p>
                                <a href="${voiceUrl}" style="background: #2F8F83; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Listen to Voice Note</a>
                            </div>` : ''}
                        </div>
                    `,
                });
            }

            // 2. Send Confirmation Email to User
            if (email) {
                await transporter.sendMail({
                    from: `"Rider of Faisalabad" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: `Confirmation: We received your message!`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                            <div style="text-align: center;">
                                <h1 style="color: #2F8F83;">Hello ${name}!</h1>
                            </div>
                            <p>Thank you for contacting <strong>Rider of Faisalabad</strong>. We have received your inquiry regarding "<strong>${subject || 'General Inquiry'}</strong>".</p>
                            <p>Our team is reviewing your message and will get back to you as soon as possible.</p>
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin-top: 0; color: #666;">Your Message:</p>
                                <p style="font-style: italic; color: #444;">"${message}"</p>
                            </div>
                            <p>If this is an urgent delivery requirement, feel free to call us directly at our helpline.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="text-align: center; color: #888; font-size: 12px;">
                                © ${new Date().getFullYear()} Rider of Faisalabad. All rights reserved.<br>
                                Faisalabad, Punjab, Pakistan.
                            </p>
                        </div>
                    `,
                });
            }
        }

        // 3. Save to Dashboard Store
        const { addContact } = await import('../../lib/contactStore');
        addContact({ name, email, phone, subject, message, voiceNote: files.voiceNote ? path.basename(files.voiceNote[0].filepath || files.voiceNote.filepath) : null });

        return res.status(200).json({ success: true, message: 'Message sent successfully! Emails dispatched.' });
    } catch (err) {
        console.error('Contact error:', err);
        return res.status(500).json({ success: false, message: 'Failed to process message.' });
    }
}
