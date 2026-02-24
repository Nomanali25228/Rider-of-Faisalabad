export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { name, email, phone, subject, message } = req.body;

    if (!name || !message) {
        return res.status(400).json({ success: false, message: 'Name and message are required.' });
    }

    try {
        if (process.env.SMTP_HOST) {
            const nodemailer = (await import('nodemailer')).default;
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            });

            if (process.env.ADMIN_EMAIL) {
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
          `,
                });
            }
        }

        return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (err) {
        console.error('Contact email error:', err);
        return res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
}
