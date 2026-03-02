import { getOrders } from '../../../lib/ordersStore';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // Check admin session
    const authHeader = req.headers.authorization;
    const adminSecret = process.env.ADMIN_SECRET || 'unjgvwpcasdterzllrnatvonycpbekmk';
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const { status, page = 1, limit = 12 } = req.query;
        const allOrders = await getOrders();

        let filtered = [...allOrders];

        if (status && status !== 'all') {
            filtered = filtered.filter(o => o.status === status);
        }

        // Sort by createdAt descending
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });

        const start = (Number(page) - 1) * Number(limit);
        const paginated = filtered.slice(start, start + Number(limit));

        // Global stats for dashboard
        const stats = {
            total: allOrders.length,
            pending: allOrders.filter(o => o.status === 'Pending').length,
            accepted: allOrders.filter(o => o.status === 'Accepted').length,
            inProgress: allOrders.filter(o => o.status === 'In Progress').length,
            delivered: allOrders.filter(o => o.status === 'Delivered').length,
            rejected: allOrders.filter(o => o.status === 'Rejected').length,
        };

        return res.status(200).json({
            success: true,
            orders: paginated,
            totalCount: filtered.length,
            stats,
            page: Number(page),
            totalPages: Math.ceil(filtered.length / Number(limit)),
        });
    } catch (err) {
        console.error('Orders fetch error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
}
