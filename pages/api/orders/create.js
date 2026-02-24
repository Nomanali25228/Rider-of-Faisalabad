import { v4 as uuidv4 } from 'uuid';
import { IncomingForm } from 'formidable';
import path from 'path';
import fs from 'fs';
import { addOrder } from '../../../lib/ordersStore';

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
        const trackingId = 'ROF-' + uuidv4().slice(0, 8).toUpperCase();

        const order = {
            _id: uuidv4(),
            trackingId,
            fullName: Array.isArray(fields.fullName) ? fields.fullName[0] : (fields.fullName || ''),
            phone: Array.isArray(fields.phone) ? fields.phone[0] : (fields.phone || ''),
            email: Array.isArray(fields.email) ? fields.email[0] : (fields.email || ''),
            pickupAddress: Array.isArray(fields.pickupAddress) ? fields.pickupAddress[0] : (fields.pickupAddress || ''),
            dropAddress: Array.isArray(fields.dropAddress) ? fields.dropAddress[0] : (fields.dropAddress || ''),
            parcelType: Array.isArray(fields.parcelType) ? fields.parcelType[0] : (fields.parcelType || ''),
            deliveryType: Array.isArray(fields.deliveryType) ? fields.deliveryType[0] : (fields.deliveryType || 'Normal'),
            message: Array.isArray(fields.message) ? fields.message[0] : (fields.message || ''),
            status: 'Pending',
            createdAt: new Date().toISOString(),
            voiceNoteUrl: files.voiceNote
                ? `/uploads/${path.basename(Array.isArray(files.voiceNote) ? files.voiceNote[0].filepath : files.voiceNote.filepath)}`
                : null,
        };

        // Add to shared in-memory store
        addOrder(order);

        // Send emails
        try {
            await sendOrderEmails(order);
        } catch (emailErr) {
            console.error('Email error (non-fatal):', emailErr.message);
        }

        return res.status(200).json({ success: true, trackingId, orderId: order._id });
    } catch (err) {
        console.error('Order creation error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create order.' });
    }
}

async function sendOrderEmails(order) {
    if (!process.env.SMTP_HOST) return;

    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const trackingLink = `${siteUrl}/track-order?id=${order.trackingId}`;

    // 1. Admin Email (Notification)
    if (process.env.ADMIN_EMAIL) {
        await transporter.sendMail({
            from: `"Rider of Faisalabad Dashboard" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `🚀 New Order Alert: ${order.trackingId}`,
            html: `
                <div style="font-family:sans-serif; padding:20px; color:#333;">
                    <h2 style="color:#2F8F83;">New Delivery Request</h2>
                    <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
                    <hr/>
                    <p><strong>Customer:</strong> ${order.fullName}</p>
                    <p><strong>Phone:</strong> ${order.phone}</p>
                    <p><strong>Pickup:</strong> ${order.pickupAddress}</p>
                    <p><strong>Drop:</strong> ${order.dropAddress}</p>
                    <p><strong>Parcel:</strong> ${order.parcelType} (${order.deliveryType})</p>
                    <p><strong>Message:</strong> ${order.message || 'No instructions'}</p>
                    <br/>
                    <a href="${siteUrl}/dashboard" style="background:#2F8F83; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Open Admin Dashboard</a>
                </div>
            `,
        });
    }

    // 2. Customer Email (Confirmation)
    if (order.email) {
        await transporter.sendMail({
            from: `"Rider of Faisalabad" <${process.env.SMTP_USER}>`,
            to: order.email,
            subject: `Your Order is Received — ${order.trackingId}`,
            html: `
                <div style="font-family:sans-serif; max-width:600px; margin:0 auto; border:1px solid #eee; border-radius:10px; overflow:hidden;">
                    <div style="background:#2F8F83; color:white; padding:30px; text-align:center;">
                        <h1 style="margin:0;">Rider of Faisalabad</h1>
                        <p style="margin-top:10px; opacity:0.9;">Order Confirmation</p>
                    </div>
                    <div style="padding:30px; line-height:1.6; color:#444;">
                        <p>Dear <strong>${order.fullName}</strong>,</p>
                        <p>We have received your delivery request. Our team will review the details and contact you with shipping rates and rider assignment within <strong>30 minutes</strong>.</p>
                        
                        <div style="background:#f9f9f9; padding:20px; border-radius:8px; margin:20px 0;">
                            <h3 style="margin-top:0; color:#2F8F83;">Order Details:</h3>
                            <p style="margin:5px 0;"><strong>Tracking ID:</strong> <span style="color:#2F8F83; font-weight:bold;">${order.trackingId}</span></p>
                            <p style="margin:5px 0;"><strong>From:</strong> ${order.pickupAddress}</p>
                            <p style="margin:5px 0;"><strong>To:</strong> ${order.dropAddress}</p>
                            <p style="margin:5px 0;"><strong>Parcel:</strong> ${order.parcelType}</p>
                        </div>
                        
                        <div style="text-align:center; margin:30px 0;">
                            <a href="${trackingLink}" style="background:#2F8F83; color:white; padding:12px 25px; text-decoration:none; border-radius:30px; font-weight:bold; display:inline-block;">Track Your Order Live</a>
                        </div>
                        
                        <p style="font-size:13px; color:#888;">If you have any questions, feel free to reply to this email or contact us via WhatsApp.</p>
                    </div>
                    <div style="background:#f4f4f4; padding:20px; text-align:center; font-size:12px; color:#999;">
                        &copy; ${new Date().getFullYear()} Rider of Faisalabad. All rights reserved.
                    </div>
                </div>
            `,
        });
    }
}
