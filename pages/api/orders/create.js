import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import { saveOrder } from '../../../lib/ordersStore';
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
        multiples: true,
        keepExtensions: true,
    });

    try {
        const [fields, files] = await form.parse(req);

        // Destructure fields (formidable returns arrays for fields in some versions)
        const getField = (key) => Array.isArray(fields[key]) ? fields[key][0] : fields[key];

        const orderData = {
            fullName: getField('fullName'),
            phone: getField('phone'),
            email: getField('email'),
            pickupAddress: getField('pickupAddress'),
            dropAddress: getField('dropAddress'),
            parcelType: getField('parcelType'),
            deliveryType: getField('deliveryType'),
            message: getField('message'),
            productDetails: getField('productDetails'), // JSON string
        };

        const trackingId = `RF-${uuidv4().substring(0, 8).toUpperCase()}`;
        const orderId = uuidv4();

        // Handle File Uploads
        let voiceNoteUrl = null;
        let attachmentUrl = null;

        // Process Voice Note
        const voiceFile = files.voiceNote?.[0] || files.voiceNote;
        if (voiceFile && voiceFile.size > 0) {
            voiceNoteUrl = await uploadToCloudinary(voiceFile.filepath, 'voice_notes');
            try { fs.unlinkSync(voiceFile.filepath); } catch (e) { console.error('Cleanup failed:', e); }
        }

        // Process Attachment
        const attachmentFile = files.attachment?.[0] || files.attachment;
        if (attachmentFile && attachmentFile.size > 0) {
            attachmentUrl = await uploadToCloudinary(attachmentFile.filepath, 'order_attachments');
            try { fs.unlinkSync(attachmentFile.filepath); } catch (e) { console.error('Cleanup failed:', e); }
        }

        const order = {
            id: orderId,
            trackingId,
            ...orderData,
            voiceNoteUrl,
            attachmentUrl,
            status: 'Pending',
            createdAt: new Date().toISOString(),
        };

        // Parse product details for email if present
        let parsedProducts = [];
        if (order.productDetails) {
            try {
                parsedProducts = JSON.parse(order.productDetails);
                if (!Array.isArray(parsedProducts)) parsedProducts = [parsedProducts];
            } catch (e) {
                console.error('Failed to parse product details:', e);
            }
        }

        await saveOrder(order);

        // Send Email Notifications
        try {
            if (process.env.SMTP_HOST) {
                await sendOrderEmails(order, parsedProducts);
            }
        } catch (emailErr) {
            console.error('Notification failed:', emailErr);
        }

        return res.status(200).json({ success: true, trackingId, orderId });
    } catch (err) {
        console.error('Order creation error:', err);
        return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
}

async function sendOrderEmails(order, products) {
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

    const productHtml = (products && products.length > 0) ? `
        <div style="background:#fdfaf0; padding:15px; border-radius:10px; border:1.2px solid #F4C542; margin:15px 0;">
            <p style="margin:0 0 10px 0; font-weight:bold; color:#000;">Selected Shop Items:</p>
            <table width="100%" style="border-collapse:collapse;">
                ${products.map(product => `
                    <tr style="border-bottom:1px solid rgba(244,197,66,0.2);">
                        <td width="60" style="padding:8px 0;"><img src="${product.image}" width="50" style="border-radius:6px;"/></td>
                        <td style="padding:8px 10px;">
                            <strong style="font-size:14px; color:#222;">${product.label}</strong><br/>
                            <span style="color:#2F8F83; font-weight:bold; font-size:13px;">RS. ${product.price}</span>
                        </td>
                    </tr>
                `).join('')}
            </table>
        </div>
    ` : '';

    const attachmentsHtml = (order.voiceNoteUrl || order.attachmentUrl) ? `
        <div style="margin-top:20px; padding-top:15px; border-top:1px solid #eee;">
            <p><strong>Attachments:</strong></p>
            ${order.voiceNoteUrl ? `<a href="${order.voiceNoteUrl}" style="display:inline-block; background:#2F8F83; color:white; padding:8px 15px; text-decoration:none; border-radius:6px; margin-right:10px;">Play Voice Note</a>` : ''}
            ${order.attachmentUrl ? `<a href="${order.attachmentUrl}" style="display:inline-block; background:#6366f1; color:white; padding:8px 15px; text-decoration:none; border-radius:6px;">View Attachment</a>` : ''}
        </div>
    ` : '';

    // To Admin
    await transporter.sendMail({
        from: `"Rider Booking" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `New Order: ${order.trackingId} — ${order.fullName}`,
        html: `
            <div style="font-family:sans-serif; color:#444; line-height:1.6; max-width:600px;">
                <h2 style="color:#2F8F83;">New Delivery Request</h2>
                <div style="background:#f8f9fa; padding:20px; border-radius:12px;">
                    <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
                    <p><strong>Customer:</strong> ${order.fullName} (${order.phone})</p>
                    <hr style="border:0; border-top:1px solid #ddd;"/>
                    <p><strong>Pickup:</strong> ${order.pickupAddress}</p>
                    <p><strong>Drop-off:</strong> ${order.dropAddress}</p>
                    <p><strong>Parcel:</strong> ${order.parcelType} (${order.deliveryType})</p>
                    ${productHtml}
                    <p><strong>Instructions:</strong> ${order.message || 'N/A'}</p>
                    ${attachmentsHtml}
                </div>
            </div>
        `,
    });

    // To Customer
    if (order.email) {
        await transporter.sendMail({
            from: `"Rider of Faisalabad" <${process.env.SMTP_USER}>`,
            to: order.email,
            subject: `Order Received — ${order.trackingId}`,
            html: `
                <div style="font-family:sans-serif; color:#444; line-height:1.6; max-width:600px; margin:0 auto; padding:20px; border:1px solid #eee; border-radius:15px;">
                    <h2 style="color:#2F8F83;">Order Placed Successfully!</h2>
                    <p>Hello <strong>${order.fullName}</strong>,</p>
                    <p>We've received your delivery request. Our team will review it and contact you shortly with the final charges.</p>
                    <div style="background:#f8f9fa; padding:15px; border-radius:10px; margin:15px 0;">
                        <p style="margin:0;"><strong>Tracking ID:</strong> <span style="color:#2F8F83; font-weight:bold;">${order.trackingId}</span></p>
                    </div>
                    ${productHtml}
                    <p>Keep this ID to track your order on our website.</p>
                    <br/>
                    <p>Best Regards,<br/><strong>Rider of Faisalabad Team</strong></p>
                </div>
            `,
        });
    }
}
