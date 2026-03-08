import formidable from 'formidable';
import { updateOrderStatus, getOrderById } from '../../../lib/ordersStore';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import nodemailer from 'nodemailer';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const form = formidable({
        keepExtensions: true,
    });

    try {
        const [fields, files] = await form.parse(req);
        const orderId = Array.isArray(fields.orderId) ? fields.orderId[0] : fields.orderId;
        const trackingId = Array.isArray(fields.trackingId) ? fields.trackingId[0] : fields.trackingId;

        if (!orderId) {
            return res.status(400).json({ success: false, message: 'OrderId is required' });
        }

        const paymentFile = files.paymentScreenshot?.[0] || files.paymentScreenshot;
        if (!paymentFile) {
            return res.status(400).json({ success: false, message: 'Payment screenshot is required' });
        }

        // Upload to Cloudinary
        const resultUrl = await uploadToCloudinary(paymentFile.filepath, 'payments');

        // Cleanup temp file
        try { fs.unlinkSync(paymentFile.filepath); } catch (e) { console.error('Cleanup failed:', e); }

        // Update Order with screenshot URL but KEEP status as Accepted
        await updateOrderStatus(orderId, 'Accepted', { paymentScreenshot: resultUrl });

        // Get detailed order for email
        const order = await getOrderById(orderId);

        // Send confirmation email to admin
        try {
            if (process.env.SMTP_HOST) {
                await sendPaymentNotification(order, resultUrl);
            }
        } catch (emailErr) {
            console.error('Email notification failed:', emailErr);
        }

        return res.status(200).json({ success: true, url: resultUrl });
    } catch (err) {
        console.error('Payment upload error:', err);
        return res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
    }
}

async function sendPaymentNotification(order, screenshotUrl) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: { rejectUnauthorized: false }
    });

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    await transporter.sendMail({
        from: `"Rider Payments" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `Payment Received — ${order.trackingId}`,
        html: `
            <div style="font-family:sans-serif; color:#444; max-width:600px; border:1px solid #eee; border-radius:16px; overflow:hidden;">
                <div style="background:#2F8F83; padding:24px; text-align:center;">
                    <h1 style="color:white; margin:0; font-size:20px;">Manual Payment Received</h1>
                </div>
                <div style="padding:24px;">
                    <p>A customer has uploaded a payment screenshot for order <strong style="color:#2F8F83;">${order.trackingId}</strong>.</p>
                    
                    <div style="background:#f8f9fa; padding:20px; border-radius:12px; margin:20px 0;">
                        <p style="margin:5px 0;"><strong>Customer:</strong> ${order.fullName}</p>
                        <p style="margin:5px 0;"><strong>Phone:</strong> ${order.phone}</p>
                        <p style="margin:5px 0;"><strong>New Status:</strong> <span style="color:#7c3aed; font-weight:bold;">In Progress</span></p>
                    </div>

                    <div style="text-align:center; margin-top:30px;">
                        <a href="${screenshotUrl}" style="background:#2F8F83; color:white; padding:14px 30px; text-decoration:none; border-radius:10px; font-weight:bold; display:inline-block; box-shadow:0 4px 12px rgba(47,143,131,0.2);">Verify Payment Screenshot</a>
                    </div>
                    
                    <p style="font-size:12px; color:#999; margin-top:30px; text-align:center;">
                        This is an automated notification from Rider of Faisalabad Dashboard.
                    </p>
                </div>
            </div>
        `,
    });
}
