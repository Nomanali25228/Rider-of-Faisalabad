import nodemailer from 'nodemailer';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { addContact } from '../../lib/contactStore';
import { uploadToCloudinary } from '../../lib/cloudinary';

export const config = {
    api: {
        bodyParser: false,
    },
};

async function parseForm(req) {
    return new Promise((resolve, reject) => {
        const os = require('os');
        const form = new IncomingForm({
            uploadDir: os.tmpdir(),
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

        if (!name || !message) {
            return res.status(400).json({ success: false, message: 'Name and message are required.' });
        }

        let voiceNoteUrl = null;
        if (files.voiceNote) {
            const voiceFile = Array.isArray(files.voiceNote) ? files.voiceNote[0] : files.voiceNote;
            const fileBuffer = fs.readFileSync(voiceFile.filepath);
            const uploadResult = await uploadToCloudinary(fileBuffer, 'video', 'contact-voice');
            voiceNoteUrl = uploadResult.url;
            try { fs.unlinkSync(voiceFile.filepath); } catch (e) { console.error('Error unlinking tmp voice note:', e); }
        }

        // 1. Send Emails
        if (process.env.SMTP_HOST) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_PORT == 465,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
                tls: { rejectUnauthorized: false }
            });

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
                            ${voiceNoteUrl ? `
                            <div style="margin-top: 20px; padding: 15px; background: #e6f4f1; border-radius: 8px;">
                                <p>🎤 <strong>A voice note was attached:</strong></p>
                                <a href="${voiceNoteUrl}" style="background: #2F8F83; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Listen to Voice Note</a>
                            </div>` : ''}
                        </div>
                    `,
                });
            }

            if (email) {
                await transporter.sendMail({
                    from: `"Rider of Faisalabad" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: `Confirmation: We received your message!`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                            <h1 style="color: #2F8F83; text-align: center;">Hello ${name}!</h1>
                            <p>Thank you for contacting <strong>Rider of Faisalabad</strong>. We have received your inquiry regarding "<strong>${subject || 'General Inquiry'}</strong>".</p>
                            <p>Our team is reviewing your message and will get back to you as soon as possible.</p>
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin-top: 0; color: #666;">Your Message:</p>
                                <p style="font-style: italic; color: #444;">"${message}"</p>
                            </div>
                            <p>If this is an urgent delivery requirement, feel free to call us directly at our helpline.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="text-align: center; color: #888; font-size: 12px;">
                                © ${new Date().getFullYear()} Rider of Faisalabad. All rights reserved.
                            </p>
                        </div>
                    `,
                });
            }
        }

        // 2. Save to GitHub Dashboard Store
        await addContact({ name, email, phone, subject, message, voiceNoteUrl });

        return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (err) {
        console.error('Contact error:', err);
        return res.status(500).json({ success: false, message: 'Failed to process message.' });
    }
}
