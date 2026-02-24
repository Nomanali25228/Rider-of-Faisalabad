import { getOrderById } from '../../../lib/ordersStore';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ success: false, message: 'Tracking ID is required' });
    }

    const orderRaw = getOrderById(id.toUpperCase());

    if (!orderRaw) {
        return res.status(404).json({ success: false, message: 'Order not found. Please check your tracking ID.' });
    }

    // Generate timeline based on status
    const statuses = ['Pending', 'Accepted', 'In Progress', 'Delivered'];
    const currentStatusIndex = statuses.indexOf(orderRaw.status);

    const timelineSteps = [
        { label: 'Order Placed', status: 'Pending' },
        { label: 'Order Accepted', status: 'Accepted' },
        { label: 'In Transit', status: 'In Progress' },
        { label: 'Delivered', status: 'Delivered' },
    ];

    const timeline = timelineSteps.map((step, index) => ({
        step: step.label,
        time: index <= currentStatusIndex ? (index === 0 ? orderRaw.createdAt : new Date().toISOString()) : null,
        done: index <= currentStatusIndex
    }));

    const order = {
        ...orderRaw,
        estimatedTime: orderRaw.status === 'Delivered' ? 'Delivered' : 'Calculating...',
        timeline
    };

    return res.status(200).json({ success: true, order });
}
