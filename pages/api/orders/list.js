import { getOrders } from '../../../lib/ordersStore';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // Check admin session
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET || 'admin-secret-2024'}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const allOrders = getOrders();
    console.log('Fetching orders from store. Total in store:', allOrders.length);
    let filtered = [...allOrders];

    if (status && status !== 'all') {
        filtered = filtered.filter(o => o.status === status);
    }

    // Reverse chronological
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const start = (Number(page) - 1) * Number(limit);
    const paginated = filtered.slice(start, start + Number(limit));

    return res.status(200).json({
        success: true,
        orders: paginated,
        total: filtered.length,
        page: Number(page),
        totalPages: Math.ceil(filtered.length / Number(limit)),
    });
}
