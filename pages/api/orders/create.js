import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import { saveOrder } from '../../../lib/ordersStore';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

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

        // Handle File Uploads in Parallel
        const uploadPromises = [];
        let voiceFile = files.voiceNote?.[0] || files.voiceNote;
        let attachmentFile = files.attachment?.[0] || files.attachment;

        if (voiceFile && voiceFile.size > 0) {
            uploadPromises.push((async () => {
                const url = await uploadToCloudinary(voiceFile.filepath, 'voice_notes');
                fs.promises.unlink(voiceFile.filepath).catch(e => console.error('Cleanup failed:', e));
                return { type: 'voiceNote', url };
            })());
        }

        if (attachmentFile && attachmentFile.size > 0) {
            uploadPromises.push((async () => {
                const url = await uploadToCloudinary(attachmentFile.filepath, 'order_attachments');
                fs.promises.unlink(attachmentFile.filepath).catch(e => console.error('Cleanup failed:', e));
                return { type: 'attachment', url };
            })());
        }

        const uploadResults = await Promise.all(uploadPromises);
        let voiceNoteUrl = uploadResults.find(r => r.type === 'voiceNote')?.url || null;
        let attachmentUrl = uploadResults.find(r => r.type === 'attachment')?.url || null;

        // Parse product details early
        let parsedProducts = [];
        if (orderData.productDetails) {
            try {
                parsedProducts = JSON.parse(orderData.productDetails);
                if (!Array.isArray(parsedProducts)) parsedProducts = [parsedProducts];
            } catch (e) {
                console.error('Failed to parse product details:', e);
            }
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

        await saveOrder(order);

        // Send Email Notifications
        try {
            if (process.env.SMTP_HOST || process.env.SMTP_USER) {
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
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = process.env.SMTP_PORT ? process.env.SMTP_PORT == 465 : true;

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: { rejectUnauthorized: false }
    });

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://riderofaisalabad.com').replace(/\/$/, '');

    // Process product images: embed local images via CID so Gmail displays them 100% reliably
    const emailAttachments = [];
    const processedProducts = (products || []).map((product, idx) => {
        let imgSrc = product.image || '';
        let displaySrc = '';

        if (imgSrc.startsWith('/')) {
            const relPath = imgSrc.startsWith('/') ? imgSrc.slice(1) : imgSrc;
            const localDiskPath = path.join(process.cwd(), 'public', relPath);

            if (fs.existsSync(localDiskPath)) {
                const cidName = `prod_img_${idx}`;
                emailAttachments.push({
                    filename: path.basename(localDiskPath),
                    path: localDiskPath,
                    cid: cidName,
                });
                displaySrc = `cid:${cidName}`;
            } else {
                displaySrc = `${siteUrl}/${encodeURI(relPath)}`;
            }
        } else if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
            displaySrc = imgSrc;
        }

        return {
            ...product,
            displaySrc: displaySrc || `${siteUrl}/uploads/logo.png`
        };
    });

    const productHtml = (processedProducts && processedProducts.length > 0) ? `
        <div style="background:#fdfaf0; padding:15px; border-radius:10px; border:1.2px solid #F4C542; margin:15px 0;">
            <p style="margin:0 0 10px 0; font-weight:bold; color:#000;">Selected Shop Items (${processedProducts.length}):</p>
            <table width="100%" style="border-collapse:collapse;">
                ${processedProducts.map(product => `
                    <tr style="border-bottom:1px solid rgba(244,197,66,0.2);">
                        <td width="70" style="padding:8px 0; vertical-align:middle;">
                            <img src="${product.displaySrc}" alt="${product.label || 'Product'}" width="60" height="60" style="border-radius:8px; object-fit:cover; border:1px solid #e5e7eb; display:block;"/>
                        </td>
                        <td style="padding:8px 12px; vertical-align:middle;">
                            <strong style="font-size:14px; color:#222; display:block;">${product.label}</strong>
                            <span style="color:#2F8F83; font-weight:bold; font-size:13px;">RS. ${product.price}</span>
                        </td>
                    </tr>
                `).join('')}
            </table>
        </div>
    ` : '';

    const attachmentsHtml = (order.voiceNoteUrl || order.attachmentUrl) ? `
        <div style="margin-top:20px; padding-top:15px; border-top:1px solid #eee;">
            <p style="margin:0 0 10px 0; font-weight:bold; color:#222;">Attachments & Uploads:</p>
            ${order.attachmentUrl ? `
                <div style="margin-bottom:12px;">
                    <p style="margin:0 0 6px 0; font-size:13px; color:#555;">Uploaded Photo / Receipt:</p>
                    <a href="${order.attachmentUrl}" target="_blank" style="text-decoration:none;">
                        <img src="${order.attachmentUrl}" alt="Customer Upload" style="max-width:280px; max-height:220px; border-radius:8px; border:1.5px solid #e2e8f0; display:block; margin-bottom:8px; object-fit:cover;" />
                    </a>
                    <a href="${order.attachmentUrl}" target="_blank" style="display:inline-block; background:#6366f1; color:white; padding:8px 15px; text-decoration:none; border-radius:6px; font-size:13px; font-weight:bold;">View Full Attachment</a>
                </div>
            ` : ''}
            ${order.voiceNoteUrl ? `
                <div style="margin-top:10px;">
                    <a href="${order.voiceNoteUrl}" target="_blank" style="display:inline-block; background:#2F8F83; color:white; padding:8px 15px; text-decoration:none; border-radius:6px; font-size:13px; font-weight:bold;">▶ Play Voice Note</a>
                </div>
            ` : ''}
        </div>
    ` : '';

    // To Admin
    await transporter.sendMail({
        from: `"Rider Booking" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `New Order: ${order.trackingId} — ${order.fullName}`,
        attachments: emailAttachments,
        html: `
            <div style="font-family:sans-serif; color:#444; line-height:1.6; max-width:600px;">
                <h2 style="color:#2F8F83;">New Delivery Request</h2>
                <div style="background:#f8f9fa; padding:20px; border-radius:12px;">
                    <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
                    <p><strong>Customer:</strong> ${order.fullName} (${order.phone})</p>
                    <hr style="border:0; border-top:1px solid #ddd;"/>
                    <p><strong>Pickup:</strong> ${order.pickupAddress || 'N/A'}</p>
                    <p><strong>Drop-off:</strong> ${order.dropAddress || 'N/A'}</p>
                    <p><strong>Parcel:</strong> ${order.parcelType || 'Standard'} (${order.deliveryType || 'Normal'})</p>
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
            attachments: emailAttachments,
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
