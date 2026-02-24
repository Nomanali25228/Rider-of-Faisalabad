import { updateOrderStatus, getOrderById } from '../../../lib/ordersStore';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { orderId, status, rejectionReason } = req.body;

    if (!orderId || !status) {
        return res.status(400).json({ success: false, message: 'orderId and status required' });
    }

    const validStatuses = ['Pending', 'Accepted', 'In Progress', 'Delivered', 'Rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
        const currentOrder = getOrderById(orderId);
        if (!currentOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Prevent updating if already Rejected
        // Prevent updating if already in a final state
        if (currentOrder.status === 'Rejected' || currentOrder.status === 'Delivered') {
            return res.status(400).json({ success: false, message: `This order is already ${currentOrder.status.toLowerCase()} and cannot be changed.` });
        }

        // Only proceed if status is actually changing
        if (currentOrder.status === status) {
            return res.status(200).json({ success: true, message: 'Status is already set to ' + status });
        }

        const extraData = status === 'Rejected' ? { rejectionReason } : {};
        const success = updateOrderStatus(orderId, status, extraData);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const order = getOrderById(orderId);

        // Send status update emails
        if (process.env.SMTP_HOST && order && order.email) {
            if (status === 'Accepted') {
                await sendAcceptedEmail(order);
            } else if (status === 'Rejected') {
                await sendRejectedEmail(order, rejectionReason);
            } else if (status === 'Delivered') {
                await sendDeliveredEmail(order);
            }
        }

        return res.status(200).json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        console.error('Status update error:', err);
        return res.status(500).json({ success: false, message: 'Update failed' });
    }
}

async function getTransporter() {
    const nodemailer = (await import('nodemailer')).default;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
}

async function sendAcceptedEmail(order) {
    const transporter = await getTransporter();
    await transporter.sendMail({
        from: `"Rider of Faisalabad" <${process.env.SMTP_USER}>`,
        to: order.email,
        subject: `Order Accepted — ${order.trackingId}`,
        html: `
            <div style="font-family:sans-serif; max-width:500px; margin:0 auto; padding:20px; border:1px solid #eee; border-radius:10px;">
                <h2 style="color:#2F8F83;">Order Accepted!</h2>
                <p>Hello <strong>${order.fullName}</strong>,</p>
                <p>Good news! Your order <strong>${order.trackingId}</strong> has been accepted. A rider will be assigned to your pick-up location soon.</p>
                <p>Thank you for choosing Rider of Faisalabad!</p>
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
                <p>Thank you for your understanding.</p>
            </div>
        `,
    });
}

async function sendDeliveredEmail(order) {
    const transporter = await getTransporter();
    const feedbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/track-order?id=${order.trackingId}`;

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
            </div>
        `,
    });
}
