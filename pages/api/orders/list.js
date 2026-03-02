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
        const { status, page = 1, limit = 20 } = req.query;
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

        return res.status(200).json({
            success: true,
            orders: paginated,
            total: filtered.length,
            page: Number(page),
            totalPages: Math.ceil(filtered.length / Number(limit)),
        });
    } catch (err) {
        console.error('Orders fetch error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
}
