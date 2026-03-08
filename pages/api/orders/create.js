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
            deliveryDate: getField('deliveryDate'),
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

        // Calculate initial total price for shop items if any
        let totalPrice = null;
        if (parsedProducts.length > 0) {
            totalPrice = parsedProducts.reduce((acc, p) => {
                const val = parseInt(p.price.replace(/[^0-9]/g, '')) || 0;
                return acc + val;
            }, 0);
        }

        const order = {
            id: orderId,
            trackingId,
            ...orderData,
            voiceNoteUrl,
            attachmentUrl,
            totalPrice: totalPrice, // Pre-fill if shop items exist
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
                    ${order.deliveryDate ? `<p><strong>Delivery Date:</strong> ${order.deliveryDate}</p>` : ''}
                    ${productHtml}
                    <p><strong>Instructions:</strong> ${order.message || 'N/A'}</p>
                    ${attachmentsHtml}
                </div>
            </div>
        `,
    });

    // To Customer
    if (order.email) {
        const hasPayment = !!order.attachmentUrl;
        const paymentInfoHtml = order.totalPrice ? `
            <div style="margin:20px 0; padding:20px; background:#fdfaf0; border:1.2px solid #F4C542; border-radius:12px; text-align:center;">
                <p style="margin:0 0 10px 0; font-weight:bold; color:#222;">Payment Required</p>
                <div style="font-size:24px; font-weight:900; color:#2F8F83;">RS. ${order.totalPrice.toLocaleString()}</div>
                <p style="font-size:13px; color:#666; margin-top:10px;">
                    ${hasPayment
                ? '✅ Thank you for uploading the screenshot. We will verify it shortly.'
                : '⚠️ Please pay the above amount to move your order forward. Upload the screenshot on the tracking page.'}
                </p>
                
                <div style="margin-top:15px; text-align:left; font-size:13px;">
                    <div style="padding:10px; background:white; border-radius:8px; border:1px solid #eee; margin-bottom:8px;">
                        <strong>JazzCash/EasyPaisa:</strong> 0302-7201810<br/>
                        <span style="color:#777;">Title: WAQAS AHMAD</span>
                    </div>
                    <div style="padding:10px; background:white; border-radius:8px; border:1px solid #eee;">
                        <strong>HBL Bank:</strong> 14667905719303<br/>
                        <span style="color:#777;">Title: WAQAS AHMAD</span>
                    </div>
                </div>
            </div>
        ` : `
            <div style="margin:20px 0; padding:15px; background:#f0fdf4; border:1.2px solid #2F8F83; border-radius:12px;">
                <p style="margin:0; font-size:14px; color:#444;">Our team will review your request and contact you within 30 minutes with the final delivery charges.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Rider of Faisalabad" <${process.env.SMTP_USER}>`,
            to: order.email,
            subject: `Order Received — ${order.trackingId}`,
            html: `
                <div style="font-family:sans-serif; color:#444; line-height:1.6; max-width:600px; margin:0 auto; padding:20px; border:1px solid #eee; border-radius:15px;">
                    <h2 style="color:#2F8F83;">Order Placed Successfully!</h2>
                    <p>Hello <strong>${order.fullName}</strong>,</p>
                    <p>We've received your delivery request. ${order.totalPrice ? 'You can proceed with the payment below.' : 'Our team will review it and contact you shortly.'}</p>
                    
                    <div style="background:#f8f9fa; padding:15px; border-radius:10px; margin:15px 0;">
                        <p style="margin:0;"><strong>Tracking ID:</strong> <span style="color:#2F8F83; font-weight:bold;">${order.trackingId}</span></p>
                    </div>

                    ${productHtml}
                    ${paymentInfoHtml}

                    <p>Track your order live here: <a href="https://riderofaisalabad.com/track-order?id=${order.trackingId}" style="color:#2F8F83; font-weight:bold; text-decoration:none;">Track Order Link</a></p>
                    
                    <div style="margin-top:20px; padding:15px; background:#f9fafb; border-radius:10px; border:1px solid #e5e7eb;">
                        <p style="margin:0; font-size:14px; color:#444;">📞 <strong>Need help?</strong> Contact us directly at <strong style="color:#2F8F83;">0306-9810032</strong>.</p>
                    </div>
                    <br/>
                    <p>Best Regards,<br/><strong>Rider of Faisalabad Team</strong></p>
                </div>
            `,
        });
    }
}
