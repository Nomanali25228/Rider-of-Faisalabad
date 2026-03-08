import nodemailer from 'nodemailer';
import { updateOrderStatus, getOrderById } from '../../../lib/ordersStore';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { orderId, status, rejectionReason, totalPrice } = req.body;

    if (!orderId || !status) {
        return res.status(400).json({ success: false, message: 'orderId and status required' });
    }

    const validStatuses = ['Pending', 'Accepted', 'In Progress', 'Delivered', 'Rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
        const currentOrder = await getOrderById(orderId);
        if (!currentOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Only proceed if status is actually changing
        if (currentOrder.status === status) {
            return res.status(200).json({ success: true, message: 'Status is already set to ' + status });
        }

        // Prevent updating if already Rejected or Delivered
        if (currentOrder.status === 'Rejected' || currentOrder.status === 'Delivered') {
            return res.status(400).json({ success: false, message: `This order is already ${currentOrder.status.toLowerCase()} and cannot be changed.` });
        }

        let extraData = {};
        if (status === 'Rejected') {
            extraData = { rejectionReason };
        } else if (status === 'Accepted') {
            extraData = { totalPrice };
        }

        const success = await updateOrderStatus(orderId, status, extraData);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Order update failed' });
        }

        const updatedOrder = await getOrderById(orderId);

        // Send status update emails
        try {
            if (process.env.SMTP_HOST && updatedOrder && updatedOrder.email) {
                if (status === 'Accepted') {
                    await sendAcceptedEmail(updatedOrder);
                } else if (status === 'Rejected') {
                    await sendRejectedEmail(updatedOrder, rejectionReason);
                } else if (status === 'In Progress') {
                    await sendInProgressEmail(updatedOrder);
                } else if (status === 'Delivered') {
                    await sendDeliveredEmail(updatedOrder);
                }
            }
        } catch (emailErr) {
            console.error('Email notification failed for status:', status, emailErr);
        }

        return res.status(200).json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        console.error('Status update error:', err);
        return res.status(500).json({ success: false, message: 'Update failed' });
    }
}

async function getTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        pool: true
    });
}

async function sendAcceptedEmail(order) {
    const transporter = await getTransporter();
    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rider-of-faisalabad.vercel.app'}/track-order?id=${order.trackingId}`;
    const hasPayment = !!order.paymentScreenshot || !!order.attachmentUrl;

    await transporter.sendMail({
        from: `"Rider of Faisalabad" <${process.env.SMTP_USER}>`,
        to: order.email,
        subject: hasPayment ? `Payment Verified & Order Accepted! — ${order.trackingId}` : `Order Accepted! — ${order.trackingId}`,
        html: `
            <div style="font-family:sans-serif; max-width:500px; margin:0 auto; padding:20px; border:1px solid #eee; border-radius:15px;">
                <h2 style="color:#2F8F83; text-align:center;">${hasPayment ? 'Payment Verified!' : 'Order Accepted!'}</h2>
                <p>Hello <strong>${order.fullName}</strong>,</p>
                <p>${hasPayment
                ? `Good news! We have verified your payment for order <strong>${order.trackingId}</strong>. We are now preparing your delivery.`
                : `Good news! Your order <strong>${order.trackingId}</strong> has been accepted. We are ready to process your delivery.`}</p>
                
                <div style="background:#fdfaf0; padding:20px; border-radius:12px; border:1.5px solid #F4C542; margin:20px 0;">
                    ${hasPayment ? `
                        <p style="margin-top:0; font-size:16px; color:#059669;"><strong>✅ Payment Received Successfully</strong></p>
                        <div style="margin:15px 0; padding:15px; background:#fff; border-radius:8px; border:1px dashed #059669; text-align:center;">
                            <span style="font-size:14px; color:#555;">Confirmed Amount:</span>
                            <div style="font-size:24px; font-weight:900; color:#059669;">RS. ${order.totalPrice || 'Verified'}</div>
                        </div>
                        <p>Your order will be moved to <strong>"In Progress"</strong> status very soon.</p>
                    ` : `
                        <p style="margin-top:0; font-size:16px;"><strong>Action Required: Payment</strong></p>
                        <div style="margin:15px 0; padding:15px; background:#fff; border-radius:8px; border:1px dashed #2F8F83; text-align:center;">
                            <span style="font-size:14px; color:#555;">Total Delivery & Items Price:</span>
                            <div style="font-size:24px; font-weight:900; color:#2F8F83;">RS. ${order.totalPrice || order.totalPrice === 0 ? order.totalPrice : 'To be confirmed'}</div>
                        </div>
                        
                        <p>To move your order to <strong>"In Progress"</strong>, please make the payment using one of the given accounts and upload the screenshot.</p>
                        
                        <div style="background:white; padding:15px; border-radius:8px; margin-bottom:15px;">
                            <p style="margin:0 0 10px 0; font-weight:bold; color:#222;">JazzCash/EasyPaisa:</p>
                            <p style="margin:5px 0; color:#555;">Account No: <strong style="color:#2F8F83;">0302-7201810</strong></p>
                            <p style="margin:0; font-size:13px; color:#777;">Title: WAQAS AHMAD</p>
                        </div>
    
                        <div style="background:white; padding:15px; border-radius:8px;">
                            <p style="margin:0 0 10px 0; font-weight:bold; color:#222;">HBL Bank:</p>
                            <p style="margin:5px 0; color:#555;">Account No: <strong style="color:#2F8F83;">14667905719303</strong></p>
                            <p style="margin:0; font-size:13px; color:#777;">Title: WAQAS AHMAD</p>
                        </div>
    
                        <div style="text-align:center; margin-top:20px;">
                            <a href="${trackingUrl}" style="background:#2F8F83; color:white; padding:12px 25px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">Upload Payment Screenshot</a>
                        </div>
                    `}
                </div>
    
                <div style="text-align:center; margin-bottom: 20px;">
                    <a href="${trackingUrl}" style="color:#2F8F83; font-weight:bold; text-decoration:none;">View Live Tracking status</a>
                </div>

                <p>Thank you for choosing Rider of Faisalabad!</p>
                <div style="margin-top:20px; padding:15px; background:#f0fdf4; border-radius:10px; border:1px solid #bbf7d0;">
                    <p style="margin:0; font-size:14px; color:#444;">📞 <strong>Need help?</strong> Contact us at <strong style="color:#2F8F83;">0306-9810032</strong>.</p>
                </div>
            </div>
        `,
    });
}
async function sendInProgressEmail(order) {
    const transporter = await getTransporter();
    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rider-of-faisalabad.vercel.app'}/track-order?id=${order.trackingId}`;

    await transporter.sendMail({
        from: `"Rider of Faisalabad" <${process.env.SMTP_USER}>`,
        to: order.email,
        subject: `Order In Progress! — ${order.trackingId}`,
        html: `
            <div style="font-family:sans-serif; max-width:500px; margin:0 auto; padding:20px; border:1px solid #eee; border-radius:10px;">
                <h2 style="color:#7c3aed;">We are working on it!</h2>
                <p>Hello <strong>${order.fullName}</strong>,</p>
                <p>We've verified your payment. Your order <strong>${order.trackingId}</strong> is now <strong style="color:#7c3aed;">In Progress</strong>!</p>
                <p>Our rider will get to work soon.</p>
                <div style="text-align:center; margin-top:20px; margin-bottom: 20px;">
                    <a href="${trackingUrl}" style="background:#7c3aed; color:white; padding:12px 25px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">Track Your Order</a>
                </div>
            </div>
        `,
    });
}

async function sendRejectedEmail(order, reason) {
    const transporter = await getTransporter();
    await transporter.sendMail({
        from: `"Rider of Faisalabad" <${process.env.SMTP_USER}>`,
        to: order.email,
        subject: `Order Update: Not Accepted — ${order.trackingId}`,
        html: `
            <div style="font-family:sans-serif; max-width:500px; margin:0 auto; padding:20px; border:1px solid #eee; border-radius:10px;">
                <h2 style="color:#dc2626;">Order Update</h2>
                <p>Hello <strong>${order.fullName}</strong>,</p>
                <p>We are sorry to inform you that your order <strong>${order.trackingId}</strong> could not be accepted at this time.</p>
                <div style="background:#fff5f5; padding:15px; border-radius:8px; border-left:4px solid #dc2626; margin:15px 0;">
                    <strong style="color:#dc2626; display:block; margin-bottom:5px;">Reason:</strong>
                    <p style="margin:0; font-style:italic;">"${reason || 'Service temporarily unavailable'}"</p>
                </div>
                <p>You can contact our support if you have any questions.</p>
                <div style="margin-top:20px; padding:15px; background:#f0fdf4; border-radius:10px; border:1px solid #bbf7d0;">
                    <p style="margin:0; font-size:14px; color:#444;">📞 <strong>Need assistance?</strong> Please call or WhatsApp us at <strong style="color:#2F8F83;">0306-9810032</strong> and we'll do our best to help resolve this for you.</p>
                </div>
                <p>Thank you for your understanding.</p>
            </div>
        `,
    });
}

async function sendDeliveredEmail(order) {
    const transporter = await getTransporter();
    const feedbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rider-of-faisalabad.vercel.app'}/track-order?id=${order.trackingId}`;

    await transporter.sendMail({
        from: `"Rider of Faisalabad" <${process.env.SMTP_USER}>`,
        to: order.email,
        subject: `Parcel Delivered! — ${order.trackingId}`,
        html: `
            <div style="font-family:sans-serif; max-width:500px; margin:0 auto; padding:20px; border:1px solid #eee; border-radius:10px;">
                <h2 style="color:#2F8F83;">Successfully Delivered!</h2>
                <p>Hello <strong>${order.fullName}</strong>,</p>
                <p>Your parcel <strong>${order.trackingId}</strong> has been successfully delivered to your destination.</p>
                <p>We hope you had a great experience with our rider!</p>
                <br/>
                <div style="text-align:center;">
                    <p><strong>Please share your feedback with us:</strong></p>
                    <a href="${feedbackUrl}" style="background:#2F8F83; color:white; padding:12px 25px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">Leave a Review</a>
                </div>
                <br/>
                <p>Thank you for choosing Rider of Faisalabad!</p>
                <div style="margin-top:15px; padding:15px; background:#f0fdf4; border-radius:10px; border:1px solid #bbf7d0;">
                    <p style="margin:0; font-size:14px; color:#444;">📞 <strong>Any concerns?</strong> If you faced any issue with your delivery or need further assistance, contact us at <strong style="color:#2F8F83;">0306-9810032</strong>. Your satisfaction matters to us!</p>
                </div>
            </div>
        `,
    });
}
