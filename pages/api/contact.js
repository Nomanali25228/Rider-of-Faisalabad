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
                secure: false,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            });

            if (process.env.ADMIN_EMAIL) {
                const voiceUrl = voiceNote ? `${process.env.NEXT_PUBLIC_SITE_URL || ''}/uploads/${path.basename(voiceNote.filepath)}` : null;

                await transporter.sendMail({
                    from: `"Rider of Faisalabad" <${process.env.SMTP_USER}>`,
                    to: process.env.ADMIN_EMAIL,
                    subject: `📩 Contact Form: ${subject || 'New Message'}`,
                    html: `
            <h3>New Contact Message</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left:4px solid #2F8F83;padding-left:16px;color:#555;">${message}</blockquote>
            ${voiceUrl ? `<p><strong>Voice Note:</strong> <a href="${voiceUrl}">Listen to Voice Message</a></p>` : ''}
          `,
                });
            }
        }

        return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (err) {
        console.error('Contact error:', err);
        return res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
}
